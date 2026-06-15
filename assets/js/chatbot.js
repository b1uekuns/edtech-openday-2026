/* ============================================================
   chatbot.js — AI Chatbot Widget (via Cloudflare Worker proxy)
   EdTech Open Day 2026
   ============================================================ */

(function () {
  "use strict";

  // ── CẤU HÌNH ─────────────────────────────────────────────────
  // Sau khi deploy Worker, thay URL này bằng URL Worker của bạn
  // Ví dụ: "https://edtech-chat.ten-cua-ban.workers.dev"
  const WORKER_URL = "https://edtech-chat.come-here-pro.workers.dev"; // ← THAY URL NÀY

  // ── QUICK REPLY SUGGESTIONS ──────────────────────────────────
  const QUICK_REPLIES = [
    "📅 Sự kiện diễn ra khi nào?",
    "💰 Có mất phí không?",
    "📝 Đăng ký ở đâu?",
    "🎓 EdTech là gì?",
    "👥 Tham gia CLB thế nào?",
  ];

  // ── STATE ─────────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  let conversationHistory = [];

  // ── CREATE DOM ───────────────────────────────────────────────
  function createWidget() {
    // Toggle button
    const toggle = document.createElement("button");
    toggle.id = "chatbot-toggle";
    toggle.setAttribute("aria-label", "Mở chat hỗ trợ AI");
    toggle.setAttribute("title", "Chat với AI EdTech");
    toggle.innerHTML = `
      <span class="cb-btn-icon">🤖</span>
      <span class="cb-btn-close">✕</span>
      <span class="cb-dot"></span>
    `;

    // Chat window
    const win = document.createElement("div");
    win.id = "chatbot-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "Chat AI EdTech");
    win.innerHTML = `
      <div class="cb-header">
        <div class="cb-avatar">🤖</div>
        <div class="cb-header-info">
          <div class="cb-name">AI EdTech Assistant</div>
          <div class="cb-status">Đang trực tuyến</div>
        </div>
        <div class="cb-header-actions">
          <button class="cb-action-btn" id="cb-clear-btn" title="Xóa lịch sử">🗑️</button>
        </div>
      </div>

      <div class="cb-messages" id="cb-messages" aria-live="polite"></div>

      <div class="cb-input-area">
        <div class="cb-textarea-wrap">
          <textarea
            id="chatbot-input"
            placeholder="Hỏi về EdTech Open Day..."
            rows="1"
            maxlength="500"
            aria-label="Nhập câu hỏi"
          ></textarea>
        </div>
        <button id="chatbot-send" aria-label="Gửi" title="Gửi (Enter)">➤</button>
      </div>
    `;

    document.body.appendChild(toggle);
    document.body.appendChild(win);
    return { toggle, win };
  }

  // ── MESSAGES ─────────────────────────────────────────────────
  function appendMessage(role, text, showQuickReplies = false) {
    const messagesEl = document.getElementById("cb-messages");
    const isBot = role === "bot";

    const msg = document.createElement("div");
    msg.className = `cb-msg ${role}`;
    msg.innerHTML = `
      <div class="cb-msg-avatar">${isBot ? "🤖" : "👤"}</div>
      <div class="cb-bubble">${escapeHtml(text).replace(/\n/g, "<br>")}</div>
    `;
    messagesEl.appendChild(msg);

    if (showQuickReplies && isBot) {
      const qr = document.createElement("div");
      qr.className = "cb-quick-replies";
      QUICK_REPLIES.forEach((label) => {
        const btn = document.createElement("button");
        btn.className = "cb-quick-btn";
        btn.textContent = label;
        btn.addEventListener("click", () => {
          qr.remove();
          sendMessage(label);
        });
        qr.appendChild(btn);
      });
      messagesEl.appendChild(qr);
    }

    scrollToBottom();
  }

  function showTyping() {
    const messagesEl = document.getElementById("cb-messages");
    const typing = document.createElement("div");
    typing.className = "cb-typing";
    typing.id = "cb-typing";
    typing.innerHTML = `
      <div class="cb-msg-avatar">🤖</div>
      <div class="cb-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesEl.appendChild(typing);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById("cb-typing");
    if (el) el.remove();
  }

  function scrollToBottom() {
    const el = document.getElementById("cb-messages");
    if (el) el.scrollTop = el.scrollHeight;
  }

  function escapeHtml(str) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  }

  // ── CALL WORKER PROXY ────────────────────────────────────────
  async function callWorker(userText) {
    const resp = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history: conversationHistory.slice(-18), // Gửi tối đa 18 tin gần nhất
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data?.error || `HTTP ${resp.status}`);
    }

    return data.reply;
  }

  // ── SEND MESSAGE ─────────────────────────────────────────────
  async function sendMessage(text) {
    const inputEl = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send");

    const msg = (text || inputEl?.value || "").trim();
    if (!msg || isLoading) return;

    if (inputEl) { inputEl.value = ""; autoResize(inputEl); }
    appendMessage("user", msg);
    conversationHistory.push({ role: "user", text: msg });

    isLoading = true;
    if (sendBtn) sendBtn.disabled = true;
    showTyping();

    try {
      const reply = await callWorker(msg);
      removeTyping();
      appendMessage("bot", reply);
      conversationHistory.push({ role: "bot", text: reply });

      // Giới hạn lịch sử 20 tin
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }
    } catch (err) {
      removeTyping();
      const errMsg = err.message || "";
      if (errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError")) {
        appendMessage("bot", "⚠️ Không kết nối được đến server. Kiểm tra lại kết nối mạng nhé!");
      } else {
        appendMessage("bot", `⚠️ ${errMsg || "Đã có lỗi xảy ra, thử lại sau nhé!"}`);
      }
      console.error("[Chatbot]", err);
    } finally {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
      if (inputEl) inputEl.focus();
    }
  }

  // ── AUTO RESIZE TEXTAREA ─────────────────────────────────────
  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  // ── TOGGLE CHAT ───────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const toggle = document.getElementById("chatbot-toggle");
    const win = document.getElementById("chatbot-window");
    toggle.classList.toggle("is-open", isOpen);
    win.classList.toggle("is-open", isOpen);
    if (isOpen) {
      const inputEl = document.getElementById("chatbot-input");
      if (inputEl) setTimeout(() => inputEl.focus(), 320);
    }
  }

  // ── INIT ──────────────────────────────────────────────────────
  function init() {
    createWidget();

    // Toggle open/close
    document.getElementById("chatbot-toggle").addEventListener("click", toggleChat);

    // Send button
    document.getElementById("chatbot-send").addEventListener("click", () => sendMessage());

    // Enter to send (Shift+Enter = new line)
    const inputEl = document.getElementById("chatbot-input");
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    inputEl.addEventListener("input", () => autoResize(inputEl));

    // Clear history
    document.getElementById("cb-clear-btn").addEventListener("click", () => {
      document.getElementById("cb-messages").innerHTML = "";
      conversationHistory = [];
      showWelcome();
    });

    // Welcome message
    showWelcome();
  }

  function showWelcome() {
    appendMessage(
      "bot",
      "Xin chào! 👋 Mình là AI Assistant của CLB EdTech.\nBạn muốn biết gì về EdTech Open Day 2026 không?",
      true
    );
  }

  // ── BOOTSTRAP ────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
