/* ============================================================
   video.js — Hero video play/pause + fly-away animations
   ============================================================ */

function initVideo() {
  const heroVideoContainer = document.getElementById("hero-video-container");
  const heroVideo = document.getElementById("hero-video");
  const playBtn = document.getElementById("play-video-btn");
  const floatCards = document.querySelectorAll(".float-card");
  const scanOverlay = document.getElementById("hero-scan-overlay");

  if (!heroVideoContainer || !heroVideo || !playBtn) return;

  // Custom play button
  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    heroVideo.play();
  });

  // When video starts playing
  heroVideo.addEventListener("play", () => {
    heroVideo.setAttribute("controls", "controls");
    playBtn.style.display = "none";
    if (scanOverlay) scanOverlay.style.display = "none";

    floatCards.forEach((card) => card.classList.add("fly-away"));
  });

  // When video pauses or ends
  heroVideo.addEventListener("pause", () => {
    playBtn.style.display = "flex";
    if (scanOverlay) scanOverlay.style.display = "block";

    floatCards.forEach((card) => card.classList.remove("fly-away"));
  });
}

/* ── Back-to-top button ── */
function initBackToTop() {
  const backBtn = document.querySelector(".back-to-top");
  if (!backBtn) return;

  let lastY = window.pageYOffset || document.documentElement.scrollTop;
  const THRESHOLD = 300;
  let visible = false;

  function showBack() {
    if (!visible) {
      backBtn.style.transform = "translateY(0)";
      backBtn.style.opacity = "1";
      backBtn.style.pointerEvents = "auto";
      visible = true;
    }
  }
  function hideBack() {
    if (visible) {
      backBtn.style.transform = "translateY(8px)";
      backBtn.style.opacity = "0";
      backBtn.style.pointerEvents = "none";
      visible = false;
    }
  }

  backBtn.style.transition = "all 220ms var(--ease)";
  backBtn.style.opacity = "0";
  backBtn.style.transform = "translateY(8px)";
  backBtn.style.pointerEvents = "none";

  window.addEventListener(
    "scroll",
    () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      const scrollingDown = y > lastY;
      if (scrollingDown && y > THRESHOLD) showBack();
      else hideBack();
      lastY = y;
    },
    { passive: true },
  );

  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
