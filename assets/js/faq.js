/* ============================================================
   faq.js — FAQ accordion toggle
   ============================================================ */

function initFAQ() {
  document.querySelectorAll(".faq-item__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      // Close all
      document
        .querySelectorAll(".faq-item.open")
        .forEach((i) => i.classList.remove("open"));

      // Toggle current
      if (!isOpen) item.classList.add("open");
    });
  });
}
