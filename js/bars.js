const CLOSED = { closed: true };
function h(open, close, nextDay) {
  return { open, close, nextDay: !!nextDay };
}

const DAYS = [
  { key: "man", label: "Mandag" },
  { key: "tir", label: "Tirsdag" },
  { key: "ons", label: "Onsdag" },
  { key: "tor", label: "Torsdag" },
  { key: "fre", label: "Fredag" },
  { key: "lor", label: "Lørdag" },
  { key: "son", label: "Søndag" },
];

const BARS = [
  {
    name: "Alléenberg Bodega",
    coords: [55.67525839695371, 12.532898297071094],
    hours: {
      man: CLOSED,
      tir: h("20:00", "05:00", true),
      ons: h("20:00", "05:00", true),
      tor: h("20:00", "05:00", true),
      fre: h("20:00", "05:00", true),
      lor: h("20:00", "05:00", true),
      son: CLOSED,
    },
  },
  {
    name: "Restaurant Amalie",
    coords: [55.682847583393816, 12.59194371605866],
    hours: {
      man: h("11:30", "16:00"),
      tir: h("11:30", "16:00"),
      ons: h("11:30", "16:00"),
      tor: h("11:30", "16:00"),
      fre: h("11:30", "16:00"),
      lor: h("11:30", "17:00"),
      son: CLOSED,
    },
  },
  {
    name: "Bo-Bi Bar",
    coords: [55.68131824085773, 12.57882817579615],
    hours: {
      man: h("12:00", "02:00", true),
      tir: h("12:00", "02:00", true),
      ons: h("12:00", "02:00", true),
      tor: h("12:00", "02:00", true),
      fre: h("12:00", "02:00", true),
      lor: h("12:00", "00:00", true),
      son: h("14:00", "02:00", true),
    },
  },
  {
    name: "Eiffel Bar",
    coords: [55.67422592444535, 12.59162356256258],
    hours: {
      man: h("09:00", "03:00", true),
      tir: h("09:00", "03:00", true),
      ons: h("09:00", "03:00", true),
      tor: h("09:00", "03:00", true),
      fre: h("09:00", "03:00", true),
      lor: h("09:00", "03:00", true),
      son: h("09:00", "03:00", true),
    },
  },
  {
    name: "Vinstue Halvfems",
    coords: [55.67545407361995, 12.547553123103642],
    hours: {
      man: h("11:00", "01:00", true),
      tir: h("11:00", "01:00", true),
      ons: h("11:00", "01:00", true),
      tor: h("11:00", "01:00", true),
      fre: h("11:00", "02:00", true),
      lor: h("11:00", "02:00", true),
      son: h("11:00", "01:00", true),
    },
  },
  {
    name: "Cafe Intime",
    coords: [55.677582871129964, 12.53242826224924],
    hours: {
      man: h("16:00", "02:00", true),
      tir: h("16:00", "02:00", true),
      ons: h("16:00", "02:00", true),
      tor: h("16:00", "02:00", true),
      fre: h("16:00", "02:00", true),
      lor: h("16:00", "02:00", true),
      son: h("16:00", "02:00", true),
    },
  },
  {
    name: "Jernbanecafeen",
    coords: [55.67236149592542, 12.563642491266272],
    hours: {
      man: h("07:00", "02:00", true),
      tir: h("07:00", "02:00", true),
      ons: h("07:00", "02:00", true),
      tor: h("07:00", "02:00", true),
      fre: h("07:00", "02:00", true),
      lor: h("07:00", "02:00", true),
      son: h("07:00", "02:00", true),
    },
  },
  {
    name: "Cafe Nick",
    coords: [55.6781974185486, 12.582500760943608],
    hours: {
      man: h("11:00", "00:00", true),
      tir: h("11:00", "00:00", true),
      ons: h("11:00", "00:00", true),
      tor: h("11:00", "00:00", true),
      fre: h("11:00", "00:00", true),
      lor: h("11:00", "00:00", true),
      son: h("14:00", "00:00", true),
    },
  },
  {
    name: "Cafe Osborne",
    coords: [55.69044073423655, 12.559599939082304],
    hours: {
      man: h("16:00", "02:00", true),
      tir: h("16:00", "02:00", true),
      ons: h("16:00", "02:00", true),
      tor: h("16:00", "02:00", true),
      fre: h("16:00", "04:30", true),
      lor: h("16:00", "04:30", true),
      son: h("16:00", "02:00", true),
    },
  },
  {
    name: "Toga Øl- og Vinstue",
    coords: [55.67881098772663, 12.580172487892337],
    hours: {
      man: h("12:00", "03:00", true),
      tir: h("12:00", "03:00", true),
      ons: h("12:00", "03:00", true),
      tor: h("12:00", "05:00", true),
      fre: h("12:00", "05:00", true),
      lor: h("12:00", "05:00", true),
      son: CLOSED,
    },
  },
  {
    name: "Told og Snaps",
    coords: [55.680134637587855, 12.591820222389895],
    hours: {
      man: h("11:30", "16:00"),
      tir: h("11:30", "16:00"),
      ons: h("11:30", "16:00"),
      tor: h("11:30", "16:00"),
      fre: h("11:30", "17:00"),
      lor: h("11:30", "17:00"),
      son: h("11:30", "16:00"),
    },
  },
  {
    name: "Under Uret",
    coords: [55.689617328517066, 12.57511471911807],
    hours: {
      man: h("11:30", "16:00"),
      tir: h("11:30", "16:00"),
      ons: h("11:30", "16:00"),
      tor: h("11:30", "16:00"),
      fre: h("11:30", "16:00"),
      lor: h("11:30", "16:00"),
      son: h("11:30", "16:00"),
    },
  },
  {
    name: "Cafe Viking",
    coords: [55.69984016902938, 12.54668698936523],
    hours: {
      man: h("09:00", "01:00", true),
      tir: h("09:00", "01:00", true),
      ons: h("09:00", "01:00", true),
      tor: h("09:00", "02:00", true),
      fre: h("09:00", "02:00", true),
      lor: h("09:00", "02:00", true),
      son: h("09:00", "20:00"),
    },
  },
];

function findBar(name) {
  return BARS.find((bar) => bar.name === name);
}

function dayLabel(dayKey) {
  return DAYS.find((d) => d.key === dayKey).label;
}

function formatHours(dayHours) {
  if (dayHours.closed) return "Stengt";
  return `${dayHours.open}–${dayHours.close}`;
}

function closesBeforeEighteen(dayHours) {
  if (dayHours.closed) return false;
  const [closeH, closeM] = dayHours.close.split(":").map(Number);
  let closeMinutes = closeH * 60 + closeM;
  if (dayHours.nextDay) closeMinutes += 24 * 60;
  return closeMinutes < 18 * 60;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const hv =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(hv));
}

function routeDistanceKm(route) {
  const coordsList = route.stops.map((name) => findBar(name).coords);
  if (route.loop) coordsList.push(coordsList[0]);
  let total = 0;
  for (let i = 0; i < coordsList.length - 1; i++) {
    total += haversineMeters(coordsList[i], coordsList[i + 1]);
  }
  return total / 1000;
}
