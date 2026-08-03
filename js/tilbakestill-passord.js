document.getElementById("reset-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const messageEl = document.getElementById("auth-message");
  messageEl.className = "auth-message";

  if (password !== password2) {
    messageEl.textContent = "Passordene er ikke like.";
    messageEl.className = "auth-message error";
    return;
  }

  try {
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw error;
    messageEl.textContent = "Passordet er oppdatert. Du kan nå logge inn.";
    messageEl.className = "auth-message success";
    document.getElementById("reset-form").reset();
  } catch (err) {
    messageEl.textContent = err.message || "Noe gikk galt. Prøv igjen.";
    messageEl.className = "auth-message error";
  }
});
