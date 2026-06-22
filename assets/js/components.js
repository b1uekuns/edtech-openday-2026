/**
 * components.js
 * Loads shared components (header, footer) and page sections dynamically.
 */

/* ── Helper: fetch an HTML fragment and inject it ── */
async function loadFragment(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.outerHTML = await res.text();
    } else {
      console.error(`Failed to load: ${url} (${res.status})`);
    }
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}

/* ── Load header + footer (used on every page) ── */
async function loadComponents() {
  await Promise.all([
    loadFragment("header-placeholder", "components/header.html"),
    loadFragment("footer-placeholder", "components/footer.html"),
  ]);

  applyNavState();
  initFakeVisitorCounter();
}

/* ── Load homepage sections ── */
async function loadSections() {
  const sectionOrder = [
    "hero",
    "stats",
    "activities",
    "programs",
    "schedule",
    "recap",
    // "faq",
    "cta",
  ];

  // Load sections sequentially so order is guaranteed
  for (const name of sectionOrder) {
    await loadFragment(`section-${name}`, `sections/${name}.html`);
  }
}

/* ── Post-load nav state (active links, href rewriting) ── */
function applyNavState() {
  const currentPath = window.location.pathname;
  const isHomePage =
    currentPath.endsWith("index.html") || currentPath.endsWith("/");

  const navLinks = document.querySelectorAll(".nav__link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    link.classList.remove("active");

    if (isHomePage) {
      // Rewrite index.html#section → #section for smooth scroll
      if (href.startsWith("index.html#")) {
        link.setAttribute("href", href.replace("index.html", ""));
      }
      if (link.dataset.section === "hero") {
        link.classList.add("active");
      }
    } else {
      if (href.includes("news.html") && currentPath.includes("news.html")) {
        link.classList.add("active");
      }
    }
  });
}

/* ── Fake Visitor Counter ── */
function initFakeVisitorCounter() {
  const counterEl = document.getElementById("visitor-count");
  if (!counterEl) return;
  
  // Base date for calculation
  const startDate = new Date("2026-01-01").getTime();
  const now = new Date().getTime();
  
  const elapsedDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  
  // Base calculation
  const baseVisitors = 15342;
  const dailyVisitors = elapsedDays * 125;
  const hourlyVisitors = new Date().getHours() * 7;
  const minutelyVisitors = Math.floor(new Date().getMinutes() / 3);
  
  let totalVisitors = baseVisitors + dailyVisitors + hourlyVisitors + minutelyVisitors;
  
  // Use localStorage to ensure it strictly increases during a user's session
  const storedVisitors = localStorage.getItem("fakeVisitorCount");
  if (storedVisitors) {
    const parsedStored = parseInt(storedVisitors, 10);
    if (parsedStored >= totalVisitors) {
      totalVisitors = parsedStored + Math.floor(Math.random() * 3) + 1;
    }
  }
  
  localStorage.setItem("fakeVisitorCount", totalVisitors);
  counterEl.textContent = totalVisitors.toLocaleString("vi-VN");
}
