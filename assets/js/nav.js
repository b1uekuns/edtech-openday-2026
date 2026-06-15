/* ============================================================
   nav.js — Active nav link on scroll + smooth scroll
   ============================================================ */

function initNav() {
  /* Highlight active link on scroll */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link[data-section]");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.dataset.section === entry.target.id,
            );
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* Smooth scroll for nav links and data-href buttons */
  document.querySelectorAll('a[href^="#"], button[data-href]').forEach((el) => {
    el.addEventListener("click", (e) => {
      const targetId = el.getAttribute("href") || el.dataset.href;
      if (!targetId || !targetId.startsWith("#")) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
