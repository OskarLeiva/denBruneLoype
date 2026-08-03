document.addEventListener("DOMContentLoaded", () => {
  const optionsContainer = document.getElementById("route-options");
  const overlay = document.getElementById("route-modal-overlay");
  const closeBtn = document.getElementById("route-modal-close");
  const titleEl = document.getElementById("route-modal-title");
  const metaEl = document.getElementById("route-modal-meta");
  const stopsEl = document.getElementById("route-modal-stops");
  const mapLinkEl = document.getElementById("route-modal-map-link");

  function openModal(route) {
    const km = routeDistanceKm(route).toLocaleString("nb-NO", {
      maximumFractionDigits: 1,
    });
    const loopText = route.loop
      ? " Ruten fører deg tilbake til der du startet."
      : "";

    titleEl.textContent = route.name;
    metaEl.textContent = `${route.description} Omtrent ${km} km i luftlinje.${loopText}`;
    stopsEl.innerHTML = route.stops
      .map((name) => `<li>${name}</li>`)
      .join("");
    mapLinkEl.href = `map.html?route=${encodeURIComponent(route.id)}`;

    overlay.classList.add("open");
  }

  function closeModal() {
    overlay.classList.remove("open");
  }

  ROUTES.forEach((route) => {
    const km = routeDistanceKm(route).toLocaleString("nb-NO", {
      maximumFractionDigits: 1,
    });

    const card = document.createElement("button");
    card.type = "button";
    card.className = "route-option";
    card.innerHTML = `
      <span class="route-option-name">${route.name}</span>
      <span class="route-option-desc">${route.description}</span>
      <span class="route-option-meta">${route.stops.length} barer &middot; ca. ${km} km</span>
    `;
    card.addEventListener("click", () => openModal(route));
    optionsContainer.appendChild(card);
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
