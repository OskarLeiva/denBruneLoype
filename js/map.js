document.addEventListener("DOMContentLoaded", async () => {
  const map = L.map("map").setView([55.6828, 12.5683], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(map);

  const BAR_ZOOM = 17;

  const routeId = new URLSearchParams(window.location.search).get("route");
  let activeRoute = routeId ? findRoute(routeId) : null;
  if (!activeRoute && routeId && routeId.startsWith("c")) {
    const customRow = await fetchCustomRouteById(routeId.slice(1));
    if (customRow) activeRoute = customRouteToRouteShape(customRow);
  }
  const stopOrder = new Map();
  if (activeRoute) {
    activeRoute.stops.forEach((name, i) => stopOrder.set(name, i + 1));
  }

  const ringGroup = L.layerGroup().addTo(map);

  const OPEN_STYLE = { color: "#faf6f0", fillColor: "#e8a33d" };
  const CLOSED_STYLE = { color: "#9a9a9a", fillColor: "#6b6b6b" };

  const currentProfile = await getCurrentProfile();
  let leaderboards = await fetchLeaderboards();

  function buildLeaderboardHtml(barName) {
    const board = leaderboards.get(barName) || [];
    if (board.length === 0) {
      return `<p class="bar-leaderboard-empty">Ingen innsjekkinger ennå.</p>`;
    }
    return `<ol class="bar-leaderboard">${board
      .map(
        (row) =>
          `<li><span>${row.username}</span><span class="bar-leaderboard-count">${row.checkin_count}</span></li>`
      )
      .join("")}</ol>`;
  }

  function buildCheckinHtml() {
    if (!currentProfile) {
      return `<a href="login.html" class="btn btn-small">Logg inn for å sjekke inn</a>`;
    }
    return `
      <textarea class="checkin-comment" placeholder="Legg til en kommentar (valgfritt)" maxlength="280"></textarea>
      <button type="button" class="btn btn-small checkin-btn">Sjekk inn</button>
      <p class="checkin-status"></p>
    `;
  }

  function buildPopupHtml(bar, dayKey) {
    const dayHours = bar.hours[dayKey];
    return `
      <div class="bar-popup">
        <h3>${bar.name}</h3>
        <p class="bar-hours">${dayLabel(dayKey)}: ${formatHours(dayHours)}</p>
        <h4 class="bar-popup-subheading">Topp 5 innsjekkinger</h4>
        ${buildLeaderboardHtml(bar.name)}
        ${buildCheckinHtml()}
      </div>
    `;
  }

  const barEntries = BARS.map((bar) => {
    const marker = L.circleMarker(bar.coords, {
      radius: 8,
      weight: 2,
      fillOpacity: 0.9,
      ...OPEN_STYLE,
    });

    const order = stopOrder.get(bar.name);
    const tooltipText = order ? `${order}. ${bar.name}` : bar.name;

    marker.bindTooltip(tooltipText, {
      direction: "top",
      offset: [0, -8],
      className: "bar-tooltip",
    });

    marker.bindPopup("", {
      className: "bar-popup-wrapper",
      minWidth: 240,
    });

    marker.on("click", () => {
      map.flyTo(bar.coords, BAR_ZOOM);
    });

    marker.on("popupopen", () => {
      const popupEl = marker.getPopup().getElement();

      // Delegate on the (stable) popup container instead of the button
      // itself, since setPopupContent() below replaces the button element
      // each time the leaderboard/status text updates.
      popupEl.addEventListener("click", async (e) => {
        const btn = e.target.closest(".checkin-btn");
        if (!btn) return;

        const commentEl = popupEl.querySelector(".checkin-comment");
        const comment = commentEl ? commentEl.value.trim() : "";

        btn.disabled = true;
        btn.textContent = "Henter posisjon...";
        const statusEl = popupEl.querySelector(".checkin-status");
        statusEl.textContent = "";
        statusEl.className = "checkin-status";

        try {
          await checkInToBar(bar.name, comment);
          leaderboards = await fetchLeaderboards();
          marker.setPopupContent(buildPopupHtml(bar, daySelect.value));
          const newStatusEl = popupEl.querySelector(".checkin-status");
          if (newStatusEl) {
            newStatusEl.textContent = "Innsjekking registrert!";
            newStatusEl.className = "checkin-status success";
          }
        } catch (err) {
          const currentStatusEl = popupEl.querySelector(".checkin-status");
          currentStatusEl.textContent = err.message;
          currentStatusEl.className = "checkin-status error";
          const currentBtn = popupEl.querySelector(".checkin-btn");
          currentBtn.disabled = false;
          currentBtn.textContent = "Sjekk inn";
        }
      });
    });

    return { bar, marker };
  });

  const group = L.featureGroup(barEntries.map((e) => e.marker)).addTo(map);

  function renderDay(dayKey) {
    ringGroup.clearLayers();

    barEntries.forEach(({ bar, marker }) => {
      const dayHours = bar.hours[dayKey];
      marker.setPopupContent(buildPopupHtml(bar, dayKey));
      marker.setStyle(dayHours.closed ? CLOSED_STYLE : OPEN_STYLE);

      if (closesBeforeEighteen(dayHours)) {
        L.circleMarker(bar.coords, {
          radius: 14,
          color: "#ff6a3d",
          weight: 2,
          dashArray: "4 3",
          fill: false,
        }).addTo(ringGroup);
      }
    });
  }

  const daySelect = document.getElementById("day-select");
  daySelect.addEventListener("change", () => renderDay(daySelect.value));
  renderDay(daySelect.value);

  if (activeRoute) {
    const lineCoords = activeRoute.stops
      .map((name) => findBar(name))
      .filter(Boolean)
      .map((bar) => bar.coords);
    if (activeRoute.loop) lineCoords.push(lineCoords[0]);

    if (lineCoords.length >= 2) {
      L.polyline(lineCoords, {
        color: "#e8a33d",
        weight: 3,
        opacity: 0.85,
        dashArray: "8 8",
      }).addTo(map);
    }

    const info = document.getElementById("route-info");
    document.getElementById("route-info-name").textContent = activeRoute.name;
    info.style.display = "flex";
  }

  map.fitBounds(group.getBounds().pad(0.15));
});
