async function loadPendingUsers() {
  const listEl = document.getElementById("pending-list");
  const emptyEl = document.getElementById("pending-empty");

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: true });

  if (error) {
    listEl.innerHTML = "";
    emptyEl.textContent = "Kunne ikke hente ventende brukere.";
    emptyEl.style.display = "block";
    return;
  }

  listEl.innerHTML = "";

  if (data.length === 0) {
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";

  data.forEach((profile) => {
    const li = document.createElement("li");
    li.className = "pending-item";

    const date = new Date(profile.created_at).toLocaleDateString("nb-NO");

    li.innerHTML = `
      <span>
        <span class="pending-item-name">${profile.username}</span>
        <span class="pending-item-date">registrert ${date}</span>
      </span>
      <button type="button" class="btn pending-approve-btn">Godkjenn</button>
    `;

    li.querySelector(".pending-approve-btn").addEventListener("click", async () => {
      const { error: approveError } = await sb
        .from("profiles")
        .update({ approved: true })
        .eq("id", profile.id);

      if (!approveError) {
        li.remove();
        if (listEl.children.length === 0) {
          emptyEl.style.display = "block";
        }
      }
    });

    listEl.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const profile = await getCurrentProfile();

  if (!profile) {
    window.location.href = "login.html";
    return;
  }

  if (profile.role !== "admin") {
    document.getElementById("access-denied").style.display = "block";
    return;
  }

  document.getElementById("pending-wrapper").style.display = "block";
  loadPendingUsers();
});
