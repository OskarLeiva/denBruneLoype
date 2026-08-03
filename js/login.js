document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const messageEl = document.getElementById("auth-message");
  messageEl.className = "auth-message";

  try {
    await loginUser(username, password);
    window.location.href = "index.html";
  } catch (err) {
    messageEl.textContent = err.message || "Noe gikk galt. Prøv igjen.";
    messageEl.className = "auth-message error";
  }
});
