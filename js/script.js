document.addEventListener("DOMContentLoaded", () => {
  console.log("denBruneLoype loaded");

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeNav();
  });
});
