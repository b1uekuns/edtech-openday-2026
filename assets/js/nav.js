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
  document.querySelectorAll('a[href*="#"], button[data-href]').forEach((el) => {
    el.addEventListener("click", (e) => {
      const href = el.getAttribute("href") || el.dataset.href;
      if (!href) return;
      
      // If we are on index.html (or root) and the link is index.html#something, handle smooth scroll
      const isAtRoot = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/');
      const isIndexAnchor = href.startsWith('index.html#');
      const isHashOnly = href.startsWith('#');

      if (!isHashOnly && !(isAtRoot && isIndexAnchor)) {
        return; // Let browser handle normal navigation to other pages
      }

      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const targetId = href.substring(hashIndex);
      const target = document.querySelector(targetId);
      
      if (target) {
        e.preventDefault();
        
        // Account for fixed header height
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
      }
    });
  });
}
