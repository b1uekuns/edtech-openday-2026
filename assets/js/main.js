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
