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
        const hash = window.location.hash;
        if (!hash || hash === "#" || hash === "#hero") {
          link.classList.add("active");
        }
      } else if (window.location.hash && link.dataset.section === window.location.hash.substring(1)) {
        link.classList.add("active");
      }
    } else {
      if (href.includes("news.html") && currentPath.includes("news.html")) {
        link.classList.add("active");
      }
      
      // Highlight "Hoạt động" if we are on one of its subpages
      const activitiesPages = ["seminars.html", "boardgame.html", "gpbl.html", "openday.html", "taphuan.html", "hoatdongngoaikhoa.html", "viettel.html"];
      if (activitiesPages.some(page => currentPath.includes(page)) && link.dataset.section === "activities") {
        link.classList.add("active");
      }
    }
  });
}


