document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([55.6828, 12.5683], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(map);

  const BAR_ZOOM = 17;

  const routeId = new URLSearchParams(window.location.search).get("route");
  const activeRoute = routeId ? findRoute(routeId) : null;
  const stopOrder = new Map();
  if (activeRoute) {
    activeRoute.stops.forEach((name, i) => stopOrder.set(name, i + 1));
  }

  const ringGroup = L.layerGroup().addTo(map);

  const OPEN_STYLE = { color: "#faf6f0", fillColor: "#e8a33d" };
  const CLOSED_STYLE = { color: "#9a9a9a", fillColor: "#6b6b6b" };

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

    return { bar, marker };
  });

  const group = L.featureGroup(barEntries.map((e) => e.marker)).addTo(map);

  function renderDay(dayKey) {
    ringGroup.clearLayers();

    barEntries.forEach(({ bar, marker }) => {
      const dayHours = bar.hours[dayKey];
      marker.setPopupContent(
        `<div class="bar-popup"><h3>${bar.name}</h3><p class="bar-hours">${dayLabel(
          dayKey
        )}: ${formatHours(dayHours)}</p></div>`
      );

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
    const lineCoords = activeRoute.stops.map((name) => findBar(name).coords);
    if (activeRoute.loop) lineCoords.push(lineCoords[0]);

    L.polyline(lineCoords, {
      color: "#e8a33d",
      weight: 3,
      opacity: 0.85,
      dashArray: "8 8",
    }).addTo(map);

    const info = document.getElementById("route-info");
    document.getElementById("route-info-name").textContent = activeRoute.name;
    info.style.display = "flex";
  }

  map.fitBounds(group.getBounds().pad(0.15));
});
