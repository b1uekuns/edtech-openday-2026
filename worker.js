/**
 * Cloudflare Worker — Gemini API Proxy
 * EdTech Open Day 2026
 *
 * Deploy tại: https://dash.cloudflare.com/workers
 * Biến môi trường cần set: GEMINI_API_KEY
 */

// ── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Bạn là trợ lý AI của CLB EdTech — câu lạc bộ Công nghệ Giáo dục.
Bạn hỗ trợ khách truy cập trang web EdTech Open Day 2026, trả lời bằng tiếng Việt một cách thân thiện, ngắn gọn và nhiệt tình.
Xưng "mình" hoặc "tôi", gọi người dùng là "bạn".

=== THÔNG TIN SỰ KIỆN ===
Tên sự kiện: EdTech Open Day 2026
Slogan: "Kết nối Tri thức — Kiến tạo Tương lai"
Ngày: 31/05/2026
Địa điểm: Hà Nội (địa điểm cụ thể thông báo sau)
Chi phí: Hoàn toàn MIỄN PHÍ 100%

=== CHƯƠNG TRÌNH ===
- Keynote từ các chuyên gia EdTech hàng đầu
- Workshop thực hành: AI trong giáo dục, thiết kế khóa học, công cụ EdTech
- Panel Discussion: Tương lai của giáo dục số
- Networking và triển lãm dự án
- Booth đăng ký thành viên CLB
- Livestream: Keynote & Panel trên Fanpage CLB (Workshop chỉ offline)

=== ĐĂNG KÝ ===
- Đăng ký tại form trên website (mục cuối trang)
- Sau đăng ký nhận email xác nhận + kit thành viên tại sự kiện
- Mang laptop hoặc điện thoại cho workshop (CLB chuẩn bị tài liệu, bút, đồ ăn nhẹ)

=== CLB EDTECH ===
- CLB chuyên về ứng dụng công nghệ trong giáo dục
- Hoạt động: nghiên cứu EdTech, phát triển sản phẩm giáo dục, workshops, networking
- Thành viên: học sinh, sinh viên từ mọi ngành — không cần biết về công nghệ
- Tuyển thành viên: Có booth tại sự kiện + link Discord cộng đồng

=== FAQ ===
Q: Sự kiện có mất phí không? → Hoàn toàn miễn phí 100%
Q: Tôi có cần biết về công nghệ không? → Không cần! Dành cho tất cả mọi người
Q: Làm thế nào để tham gia CLB? → Booth đăng ký tại sự kiện hoặc Discord cộng đồng
Q: Có cần mang gì không? → Laptop/điện thoại cho workshop; CLB chuẩn bị phần còn lại
Q: Có livestream không? → Có, Keynote và Panel livestream trên Fanpage CLB

=== NGÀNH EDTECH ===
- EdTech (Education Technology): ứng dụng công nghệ để nâng cao chất lượng giảng dạy và học tập
- Xu hướng: AI trong giáo dục, gamification, microlearning, adaptive learning, LMS
- Công cụ phổ biến: Google Workspace for Education, Canvas, Moodle, Kahoot, Duolingo, Coursera
- AI trong EdTech: ChatGPT, Gemini, GitHub Copilot hỗ trợ cá nhân hóa học tập
- Cơ hội nghề nghiệp: instructional designer, learning engineer, EdTech product manager, AI trainer

=== THÔNG TIN LIÊN HỆ ===
- Email: liên hệ qua form trên website hoặc inbox Fanpage CLB EdTech
- Discord: link tại booth sự kiện

Nếu không biết thông tin cụ thể, hãy thành thật nói "thông tin này chưa được công bố, bạn theo dõi fanpage CLB để cập nhật nhé!" thay vì bịa ra.
Trả lời ngắn gọn, tối đa 3-4 câu trừ khi cần giải thích chi tiết. Dùng emoji vừa phải.`;

// ── CORS HEADERS ─────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",           // Đổi thành domain của bạn khi production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: CORS_HEADERS }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { message, history = [] } = body;
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'message' field" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Build conversation contents
    const contents = history.map((m) => ({
      role: m.role === "bot" ? "model" : "user",
      parts: [{ text: m.text }],
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    // Call Gemini API (key từ biến môi trường — không bao giờ lộ ra ngoài)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    let geminiRes;
    try {
      geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            topP: 0.9,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Lỗi kết nối tới Gemini API" }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = data?.error?.message || `Gemini error ${geminiRes.status}`;
      return new Response(
        JSON.stringify({ error: msg }),
        { status: geminiRes.status, headers: CORS_HEADERS }
      );
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return new Response(
      JSON.stringify({ reply: text || "Xin lỗi, mình không nhận được phản hồi." }),
      { status: 200, headers: CORS_HEADERS }
    );
  },
};
