/* ============================================================
   scroll-reveal.js — Intersection Observer scroll reveal
   ============================================================ */

function initScrollReveal() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = entry.target.parentElement.querySelectorAll(".rv");
          let idx = 0;
          siblings.forEach((el, j) => {
            if (el === entry.target) idx = j;
          });
          setTimeout(() => entry.target.classList.add("in"), idx * 55);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07 },
  );

  document.querySelectorAll(".rv").forEach((el) => revealObserver.observe(el));
}
