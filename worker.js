/**
 * Cloudflare Worker — RAG Chatbot Proxy
 * EdTech Open Day 2026
 *
 * Bindings cần thiết (khai báo trong wrangler.toml):
 *   - env.AI         → Workers AI (embedding)
 *   - env.VECTORIZE  → Vectorize index "edtech-docs"
 *
 * Biến môi trường (Settings → Variables):
 *   - GEMINI_API_KEY hoặc GROQ_API_KEY
 */

// ── CẤU HÌNH LLM ─────────────────────────────────────────────────────────────
// Đổi thành "groq" nếu muốn dùng Groq thay Gemini
const LLM_PROVIDER = "groq"; // "gemini" | "groq"

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Bạn là trợ lý AI của CLB EdTech — câu lạc bộ Công nghệ Giáo dục.
Bạn hỗ trợ khách truy cập trang web EdTech Open Day 2026, trả lời bằng tiếng Việt một cách thân thiện, ngắn gọn và nhiệt tình.
Xưng "mình" hoặc "tôi", gọi người dùng là "bạn".

Khi được cung cấp tài liệu liên quan, hãy ưu tiên thông tin từ tài liệu đó để đảm bảo chính xác.
Nếu không tìm thấy thông tin trong tài liệu, hãy thành thật nói "thông tin này chưa được công bố, bạn theo dõi fanpage CLB để cập nhật nhé!"

=== THÔNG TIN CHUNG ===
Tên sự kiện: EdTech Open Day 2026
Slogan: "Kết nối Tri thức — Kiến tạo Tương lai"
Ngày: 19/07/2026 | Địa điểm: Hà Nội | Chi phí: Miễn phí 100%

Trả lời ngắn gọn, tối đa 3-4 câu trừ khi cần giải thích chi tiết. Dùng emoji vừa phải.`;

// ── CORS HEADERS ──────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// ── EMBEDDING ─────────────────────────────────────────────────────────────────
async function getEmbedding(text, env) {
  const result = await env.AI.run("@cf/baai/bge-m3", { text: [text] });
  return result.data[0];
}

// ── RETRIEVE CONTEXT TỪ VECTORIZE ─────────────────────────────────────────────
async function retrieveContext(query, env, topK = 5) {
  try {
    const queryEmbedding = await getEmbedding(query, env);
    const results = await env.VECTORIZE.query(queryEmbedding, {
      topK,
      returnMetadata: "all",
    });

    if (!results.matches || results.matches.length === 0) return "";

    // Lọc những kết quả đủ liên quan (score >= 0.5)
    const relevant = results.matches.filter((m) => m.score >= 0.5);
    if (relevant.length === 0) return "";

    const contextParts = relevant.map((m, i) => {
      const src = m.metadata?.source ? ` [Nguồn: ${m.metadata.source}]` : "";
      return `[${i + 1}]${src}\n${m.metadata?.text || ""}`;
    });

    return contextParts.join("\n\n---\n\n");
  } catch (err) {
    // Nếu Vectorize chưa có data hoặc lỗi → tiếp tục không có context
    console.error("Vectorize query error:", err.message);
    return "";
  }
}

// ── CALL LLM ─────────────────────────────────────────────────────────────────
async function callLLM(messages, env) {
  try {
    const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages,
      max_tokens: 512,
    });
    return response.response;
  } catch (err) {
    console.error("Workers AI LLM Error:", err);
    throw new Error("Lỗi Cloudflare AI: " + err.message);
  }
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: CORS_HEADERS,
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: CORS_HEADERS,
      });
    }

    const { message, history = [] } = body;
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'message' field" }), {
        status: 400, headers: CORS_HEADERS,
      });
    }

    // ── RAG: Lấy context từ tài liệu ────────────────────────────
    let context = "";
    try {
      context = await retrieveContext(message, env);
    } catch (_) {
      // Không có context → vẫn trả lời được, chỉ dựa vào system prompt
    }

    // ── Build prompt với context ─────────────────────────────────
    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\n=== TÀI LIỆU LIÊN QUAN ===\n${context}\n\nHãy dựa vào tài liệu trên để trả lời chính xác.`
      : SYSTEM_PROMPT;

    const messages = [
      { role: "system", content: systemContent },
      ...history.slice(-16).map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    // ── Gọi LLM ─────────────────────────────────────────────────
    try {
      const reply = await callLLM(messages, env);
      return new Response(JSON.stringify({ reply }), {
        status: 200, headers: CORS_HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Lỗi AI" }), {
        status: 502, headers: CORS_HEADERS,
      });
    }
  },
};
