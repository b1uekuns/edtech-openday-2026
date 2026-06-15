/* ============================================================
   theme.js — Dark / Light theme toggle
   ============================================================ */

function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  const moonIcon = '<img src="assets/img/svg/moon.svg" style="width: 20px; height: 20px; filter: brightness(0) invert(1);" alt="Moon">';
  const sunIcon  = '<img src="assets/img/svg/sun-bright.svg" style="width: 20px; height: 20px; filter: brightness(0) invert(1);" alt="Sun">';

  // Apply saved theme on load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.innerHTML = moonIcon;
  } else {
    themeToggle.innerHTML = sunIcon;
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "light") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
      themeToggle.innerHTML = sunIcon;
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      themeToggle.innerHTML = moonIcon;
    }
  });
}
