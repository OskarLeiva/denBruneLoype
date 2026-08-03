document
  .getElementById("forgot-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("identifier").value.trim();
    const messageEl = document.getElementById("auth-message");
    messageEl.className = "auth-message";

    try {
      await requestPasswordReset(identifier);
      messageEl.textContent =
        "Det er sendt en e-post med lenke for å tilbakestille passordet.";
      messageEl.className = "auth-message success";
    } catch (err) {
      messageEl.textContent = err.message || "Noe gikk galt. Prøv igjen.";
      messageEl.className = "auth-message error";
    }
  });
