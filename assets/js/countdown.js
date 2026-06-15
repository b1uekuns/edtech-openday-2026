/* ============================================================
   countdown.js — Countdown timer to event date
   ============================================================ */

function initCountdown() {
  const EVENT_DATE = new Date("2025-05-31T08:30:00");

  const cdEls = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
  };

  function pad(n) {
    return String(Math.floor(n)).padStart(2, "0");
  }

  function tickCountdown() {
    const diff = Math.max(0, EVENT_DATE - new Date());
    if (cdEls.d) cdEls.d.textContent = pad(diff / 864e5);
    if (cdEls.h) cdEls.h.textContent = pad((diff % 864e5) / 36e5);
    if (cdEls.m) cdEls.m.textContent = pad((diff % 36e5) / 6e4);
    if (cdEls.s) cdEls.s.textContent = pad((diff % 6e4) / 1e3);
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);
}
