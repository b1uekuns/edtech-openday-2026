/* ============================================================
   main.js — Entry point
   Loads components & sections, then initialises all features.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

  /* ── 1. Load shared components (header/footer) ── */
  if (typeof loadComponents === "function") {
    await loadComponents();
  }

  /* ── 2. Load homepage sections (only on index) ── */
  if (typeof loadSections === "function") {
    const isHome =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");
    if (isHome) {
      await loadSections();
      
      // Handle hash navigation after dynamic sections are loaded
      if (window.location.hash) {
        setTimeout(() => {
          const target = document.querySelector(window.location.hash);
          if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                 top: offsetPosition,
                 behavior: "smooth"
            });
          }
        }, 100);
      }
    }
  }

  /* ── 3. Initialise features ── */
  if (typeof initCountdown    === "function") initCountdown();
  if (typeof initScrollReveal === "function") initScrollReveal();
  if (typeof initFAQ          === "function") initFAQ();
  if (typeof initNav          === "function") initNav();
  if (typeof initTheme        === "function") initTheme();
  if (typeof initVideo        === "function") initVideo();
  if (typeof initBackToTop    === "function") initBackToTop();

}); // end DOMContentLoaded
