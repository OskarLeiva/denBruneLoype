document.addEventListener("DOMContentLoaded", async () => {
  const profile = await getCurrentProfile();

  if (!profile) {
    window.location.href = "login.html";
    return;
  }

  const listEl = document.getElementById("checkin-list");
  const emptyEl = document.getElementById("checkin-empty");
  const summaryEl = document.getElementById("checkin-summary");
  const streakEl = document.getElementById("streak-summary");

  function weekIndex(date) {
    const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
    const utcDays = Math.floor(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
    );
    return Math.floor((utcDays - dayOfWeek) / 7);
  }

  function computeCurrentStreak(checkinsList) {
    if (!checkinsList.length) return 0;
    const weekIndices = [
      ...new Set(checkinsList.map((c) => weekIndex(new Date(c.created_at)))),
    ].sort((a, b) => b - a);

    const thisWeek = weekIndex(new Date());
    if (weekIndices[0] < thisWeek - 1) return 0;

    let streak = 1;
    for (let i = 1; i < weekIndices.length; i++) {
      if (weekIndices[i - 1] - weekIndices[i] === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function renderStreak(checkinsList) {
    const streak = computeCurrentStreak(checkinsList);
    if (streak > 0) {
      streakEl.textContent = `🔥 ${streak} ${
        streak === 1 ? "ukes" : "ukers"
      } streak`;
      streakEl.className = "streak-summary active";
    } else {
      streakEl.textContent =
        "Ingen aktiv streak – sjekk inn denne uken for å starte en ny!";
      streakEl.className = "streak-summary";
    }
  }

  const { data, error } = await sb
    .from("checkins")
    .select("bar_name, created_at, comment")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    summaryEl.textContent = "Du har sjekket inn 0 ganger totalt.";
    renderStreak([]);
    emptyEl.style.display = "block";
    return;
  }

  summaryEl.textContent = `Du har sjekket inn ${data.length} ${
    data.length === 1 ? "gang" : "ganger"
  } totalt.`;
  renderStreak(data);

  function computeCompletionBadges(checkinsAsc, totalBars) {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const badges = [];
    let windowCheckins = [];

    checkinsAsc.forEach((checkin) => {
      windowCheckins.push(checkin);
      const cutoff = new Date(checkin.created_at).getTime() - DAY_MS;
      while (
        windowCheckins.length &&
        new Date(windowCheckins[0].created_at).getTime() < cutoff
      ) {
        windowCheckins.shift();
      }

      const distinctBars = new Set(windowCheckins.map((c) => c.bar_name));
      if (distinctBars.size >= totalBars) {
        badges.push(new Date(checkin.created_at));
        windowCheckins = [];
      }
    });

    return badges;
  }

  const checkinsAsc = [...data].reverse();
  const badges = computeCompletionBadges(checkinsAsc, BARS.length);
  const badgeListEl = document.getElementById("badge-list");
  badges.forEach((completedAt) => {
    const dateStr = completedAt.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const badge = document.createElement("span");
    badge.className = "route-badge";
    badge.textContent = `Fullførte løype ${dateStr}`;
    badgeListEl.appendChild(badge);
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  data.forEach((checkin) => {
    const li = document.createElement("li");
    li.className = "pending-item checkin-item";

    const date = new Date(checkin.created_at).toLocaleString("nb-NO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const commentHtml = checkin.comment
      ? `<p class="checkin-item-comment">«${escapeHtml(checkin.comment)}»</p>`
      : "";

    li.innerHTML = `
      <span class="checkin-item-main">
        <span>
          <span class="pending-item-name">${checkin.bar_name}</span>
          <span class="pending-item-date">${date}</span>
        </span>
      </span>
      ${commentHtml}
    `;

    listEl.appendChild(li);
  });
});
