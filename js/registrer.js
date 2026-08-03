document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
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
      await signUpUser(username, email, password);
      messageEl.textContent =
        "Kontoen er opprettet! Den må godkjennes av en administrator før du kan logge inn.";
      messageEl.className = "auth-message success";
      document.getElementById("register-form").reset();
    } catch (err) {
      messageEl.textContent = err.message || "Noe gikk galt. Prøv igjen.";
      messageEl.className = "auth-message error";
    }
  });
