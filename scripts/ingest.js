/**
 * ingest.js — Script đọc PDF và upload embeddings lên Cloudflare Vectorize
 * EdTech Open Day 2026
 *
 * Cách dùng:
 *   1. Đặt file PDF vào thư mục docs/
 *   2. Chạy: node scripts/ingest.js
 *
 * Yêu cầu biến môi trường (đặt trong file .env hoặc export trước khi chạy):
 *   CF_ACCOUNT_ID   — Cloudflare Account ID (tìm trong dash.cloudflare.com)
 *   CF_API_TOKEN    — Cloudflare API Token (cần quyền: Workers AI Write + Vectorize Write)
 *   VECTORIZE_INDEX — Tên index (mặc định: edtech-docs)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CẤU HÌNH ─────────────────────────────────────────────────────────────────
const CF_ACCOUNT_ID  = "aa779ef39242627d469e6f03ce595558";
const CF_API_TOKEN   = process.env.CF_API_TOKEN || ""; // DO NOT HARDCODE TOKEN HERE
const INDEX_NAME     = process.env.VECTORIZE_INDEX || "edtech-docs";
const DOCS_DIR       = path.join(__dirname, "../docs");
const CHUNK_SIZE     = 500;   // ký tự mỗi chunk
const CHUNK_OVERLAP  = 80;    // ký tự overlap giữa các chunk
const BATCH_SIZE     = 20;    // số vectors upsert mỗi lần (Vectorize limit)

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error("❌ Thiếu CF_ACCOUNT_ID hoặc CF_API_TOKEN");
  console.error("   Chạy: $env:CF_ACCOUNT_ID='xxx'; $env:CF_API_TOKEN='yyy'; node scripts/ingest.js");
  process.exit(1);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

/** Tách text thành các chunk có overlap */
function chunkText(text, filename) {
  // Chuẩn hóa: bỏ nhiều dòng trắng liên tiếp, trim
  const clean = text.replace(/\n{3,}/g, "\n\n").replace(/\s+$/gm, "").trim();
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    const slice = clean.slice(start, end);

    // Tránh chunk quá ngắn (ít hơn 50 ký tự) ở cuối
    if (slice.trim().length >= 50) {
      chunks.push({
        id: `${path.basename(filename, ".pdf")}_${chunkIndex}`,
        text: slice.trim(),
        source: path.basename(filename),
        chunkIndex,
      });
      chunkIndex++;
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

/** Tạo embedding qua Cloudflare Workers AI REST API */
async function embedTexts(texts) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: texts }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Workers AI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error("Workers AI: " + JSON.stringify(data.errors));
  return data.result.data; // mảng float[]
}

/** Upsert vectors vào Cloudflare Vectorize */
async function upsertVectors(vectors) {
  // vectors = [{ id, values: float[], metadata }]
  const ndjson = vectors.map((v) => JSON.stringify(v)).join("\n");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/vectorize/v2/indexes/${INDEX_NAME}/upsert`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/x-ndjson",
      },
      body: ndjson,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vectorize upsert error ${res.status}: ${err}`);
  }

  return res.json();
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  // Kiểm tra thư mục docs/
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    console.log("📁 Đã tạo thư mục docs/ — hãy đặt file PDF vào đó rồi chạy lại.");
    process.exit(0);
  }

  const pdfFiles = fs.readdirSync(DOCS_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (pdfFiles.length === 0) {
    console.log("⚠️  Không tìm thấy file PDF trong docs/");
    process.exit(0);
  }

  console.log(`📄 Tìm thấy ${pdfFiles.length} file PDF: ${pdfFiles.join(", ")}`);

  let allChunks = [];

  // Extract text từ mỗi PDF
  for (const file of pdfFiles) {
    const filePath = path.join(DOCS_DIR, file);
    console.log(`\n📖 Đang đọc: ${file}`);

    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    console.log(`   ${text.length} ký tự → đang chunk...`);
    const chunks = chunkText(text, file);
    console.log(`   → ${chunks.length} chunks`);
    allChunks = allChunks.concat(chunks);
  }

  console.log(`\n🔢 Tổng: ${allChunks.length} chunks — bắt đầu embed...`);

  // Embed và upsert theo batch
  let uploaded = 0;
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.text);

    process.stdout.write(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)}: embed... `);
    const embeddings = await embedTexts(texts);

    const vectors = batch.map((chunk, idx) => ({
      id: chunk.id,
      values: embeddings[idx],
      metadata: {
        text: chunk.text,
        source: chunk.source,
        chunkIndex: chunk.chunkIndex,
      },
    }));

    process.stdout.write("upsert... ");
    await upsertVectors(vectors);
    uploaded += batch.length;
    console.log(`✅ (${uploaded}/${allChunks.length})`);

    // Tránh rate limit
    if (i + BATCH_SIZE < allChunks.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n🎉 Hoàn thành! ${uploaded} vectors đã được lưu vào Vectorize index "${INDEX_NAME}"`);
}

main().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});
