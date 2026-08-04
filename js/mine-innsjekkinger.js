document.addEventListener("DOMContentLoaded", async () => {
  const profile = await getCurrentProfile();

  if (!profile) {
    window.location.href = "login.html";
    return;
  }

  const listEl = document.getElementById("checkin-list");
  const emptyEl = document.getElementById("checkin-empty");
  const summaryEl = document.getElementById("checkin-summary");

  const { data, error } = await sb
    .from("checkins")
    .select("bar_name, created_at")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    summaryEl.textContent = "Du har sjekket inn 0 ganger totalt.";
    emptyEl.style.display = "block";
    return;
  }

  summaryEl.textContent = `Du har sjekket inn ${data.length} ${
    data.length === 1 ? "gang" : "ganger"
  } totalt.`;

  data.forEach((checkin) => {
    const li = document.createElement("li");
    li.className = "pending-item";

    const date = new Date(checkin.created_at).toLocaleString("nb-NO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    li.innerHTML = `
      <span>
        <span class="pending-item-name">${checkin.bar_name}</span>
        <span class="pending-item-date">${date}</span>
      </span>
    `;

    listEl.appendChild(li);
  });
});
