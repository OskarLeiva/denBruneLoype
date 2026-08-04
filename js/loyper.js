document.addEventListener("DOMContentLoaded", async () => {
  const currentProfile = await getCurrentProfile();

  const optionsContainer = document.getElementById("route-options");
  const publicContainer = document.getElementById("public-route-options");
  const privateContainer = document.getElementById("private-route-options");
  const publicEmptyEl = document.getElementById("public-routes-empty");
  const privateEmptyEl = document.getElementById("private-routes-empty");
  const privateSection = document.getElementById("private-routes-section");

  const overlay = document.getElementById("route-modal-overlay");
  const closeBtn = document.getElementById("route-modal-close");
  const titleEl = document.getElementById("route-modal-title");
  const metaEl = document.getElementById("route-modal-meta");
  const stopsEl = document.getElementById("route-modal-stops");
  const mapLinkEl = document.getElementById("route-modal-map-link");
  const deleteBtn = document.getElementById("route-modal-delete");

  let openCustomRouteId = null;

  function openModal(route, customRouteId) {
    openCustomRouteId = customRouteId || null;

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

    deleteBtn.style.display = customRouteId ? "block" : "none";

    overlay.classList.add("open");
  }

  function closeModal() {
    overlay.classList.remove("open");
    openCustomRouteId = null;
  }

  function renderRouteCard(container, route, customRouteId) {
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
    card.addEventListener("click", () => openModal(route, customRouteId));
    container.appendChild(card);
  }

  ROUTES.forEach((route) => renderRouteCard(optionsContainer, route));

  async function loadPublicRoutes() {
    publicContainer.innerHTML = "";
    const rows = await fetchPublicRoutes();
    publicEmptyEl.style.display = rows.length === 0 ? "block" : "none";
    rows.forEach((row) => {
      renderRouteCard(publicContainer, customRouteToRouteShape(row), row.id);
    });
  }

  async function loadPrivateRoutes() {
    if (!currentProfile) {
      privateSection.style.display = "none";
      return;
    }
    privateContainer.innerHTML = "";
    const rows = await fetchMyPrivateRoutes();
    privateEmptyEl.style.display = rows.length === 0 ? "block" : "none";
    rows.forEach((row) => {
      renderRouteCard(privateContainer, customRouteToRouteShape(row), row.id);
    });
  }

  await loadPublicRoutes();
  await loadPrivateRoutes();

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  deleteBtn.addEventListener("click", async () => {
    if (!openCustomRouteId) return;
    if (!confirm("Er du sikker på at du vil slette denne løypen?")) return;
    try {
      await deleteCustomRoute(openCustomRouteId);
      closeModal();
      await loadPublicRoutes();
      await loadPrivateRoutes();
    } catch (err) {
      alert(err.message);
    }
  });

  // --- Create route ---

  const createBtn = document.getElementById("create-route-btn");
  const createOverlay = document.getElementById("create-route-overlay");
  const createClose = document.getElementById("create-route-close");
  const nameInput = document.getElementById("create-route-name");
  const publicCheckbox = document.getElementById("create-route-public");
  const availableListEl = document.getElementById("available-bars-list");
  const selectedListEl = document.getElementById("selected-bars-list");
  const selectedCountEl = document.getElementById("selected-count");
  const selectedDistanceEl = document.getElementById("selected-distance");
  const errorEl = document.getElementById("create-route-error");
  const saveBtn = document.getElementById("save-route-btn");

  let selectedStops = [];

  function renderBarPicker() {
    availableListEl.innerHTML = BARS.filter(
      (bar) => !selectedStops.includes(bar.name)
    )
      .map(
        (bar) => `
          <li>
            <span>${bar.name}</span>
            <button type="button" class="bar-picker-add" data-name="${bar.name}">+</button>
          </li>
        `
      )
      .join("");

    selectedListEl.innerHTML = selectedStops
      .map(
        (name, i) => `
          <li>
            <span>${i + 1}. ${name}</span>
            <span class="bar-picker-controls">
              <button type="button" class="bar-picker-up" data-i="${i}" ${
          i === 0 ? "disabled" : ""
        }>&uarr;</button>
              <button type="button" class="bar-picker-down" data-i="${i}" ${
          i === selectedStops.length - 1 ? "disabled" : ""
        }>&darr;</button>
              <button type="button" class="bar-picker-remove" data-i="${i}">&times;</button>
            </span>
          </li>
        `
      )
      .join("");

    selectedCountEl.textContent = selectedStops.length;
    selectedDistanceEl.textContent =
      selectedStops.length >= 2
        ? routeDistanceKm({ stops: selectedStops, loop: false }).toLocaleString(
            "nb-NO",
            { maximumFractionDigits: 1 }
          )
        : "0";
  }

  function openCreateModal() {
    if (!currentProfile) {
      window.location.href = "login.html";
      return;
    }
    nameInput.value = "";
    publicCheckbox.checked = false;
    selectedStops = [];
    errorEl.style.display = "none";
    renderBarPicker();
    createOverlay.classList.add("open");
  }

  function closeCreateModal() {
    createOverlay.classList.remove("open");
  }

  createBtn.addEventListener("click", openCreateModal);
  createClose.addEventListener("click", closeCreateModal);
  createOverlay.addEventListener("click", (e) => {
    if (e.target === createOverlay) closeCreateModal();
  });

  availableListEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".bar-picker-add");
    if (!btn) return;
    selectedStops.push(btn.dataset.name);
    renderBarPicker();
  });

  selectedListEl.addEventListener("click", (e) => {
    const upBtn = e.target.closest(".bar-picker-up");
    const downBtn = e.target.closest(".bar-picker-down");
    const removeBtn = e.target.closest(".bar-picker-remove");

    if (upBtn) {
      const i = Number(upBtn.dataset.i);
      [selectedStops[i - 1], selectedStops[i]] = [
        selectedStops[i],
        selectedStops[i - 1],
      ];
      renderBarPicker();
    } else if (downBtn) {
      const i = Number(downBtn.dataset.i);
      [selectedStops[i], selectedStops[i + 1]] = [
        selectedStops[i + 1],
        selectedStops[i],
      ];
      renderBarPicker();
    } else if (removeBtn) {
      const i = Number(removeBtn.dataset.i);
      selectedStops.splice(i, 1);
      renderBarPicker();
    }
  });

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    errorEl.style.display = "none";

    if (!name) {
      errorEl.textContent = "Løypen må ha et navn.";
      errorEl.style.display = "block";
      return;
    }
    if (selectedStops.length < 2) {
      errorEl.textContent = "Velg minst 2 barer for løypen.";
      errorEl.style.display = "block";
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Lagrer...";

    try {
      await createCustomRoute({
        name,
        stops: selectedStops,
        isPublic: publicCheckbox.checked,
        profile: currentProfile,
      });
      closeCreateModal();
      await loadPublicRoutes();
      await loadPrivateRoutes();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Lagre løype";
    }
  });
});
