function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Nettleseren din støtter ikke stedstjenester."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error("Du må gi tilgang til posisjonen din for å sjekke inn.")
          );
        } else {
          reject(new Error("Fant ikke posisjonen din. Prøv igjen."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function checkInToBar(barName) {
  const coords = await getCurrentLocation();
  const { data, error } = await sb.rpc("check_in", {
    p_bar_name: barName,
    p_lat: coords.latitude,
    p_lng: coords.longitude,
  });
  if (error) throw new Error(error.message);
  return data;
}

async function fetchLeaderboards() {
  const map = new Map();
  const { data, error } = await sb.from("bar_leaderboard").select("*");
  if (error || !data) return map;

  data.forEach((row) => {
    if (!map.has(row.bar_name)) map.set(row.bar_name, []);
    map.get(row.bar_name).push(row);
  });
  map.forEach((rows) => rows.sort((a, b) => a.rnk - b.rnk));

  return map;
}
