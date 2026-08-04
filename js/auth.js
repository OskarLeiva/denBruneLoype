async function getEmailForUsername(username) {
  const { data, error } = await sb.rpc("get_email_for_username", {
    uname: username,
  });
  if (error) throw error;
  return data;
}

async function signUpUser(username, email, password) {
  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    if (error.message && /database/i.test(error.message)) {
      throw new Error("Brukernavnet er allerede i bruk.");
    }
    throw error;
  }

  // signUp() logs the user in immediately (email confirmation is disabled),
  // but new accounts must wait for admin approval, so drop that session.
  await sb.auth.signOut();
}

async function loginUser(username, password) {
  const email = await getEmailForUsername(username);
  if (!email) {
    throw new Error("Fant ingen bruker med det brukernavnet.");
  }

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error("Feil brukernavn eller passord.");

  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) throw profileError;

  if (!profile.approved) {
    await sb.auth.signOut();
    throw new Error(
      "Kontoen din venter fortsatt på godkjenning fra en administrator."
    );
  }

  return profile;
}

async function logoutUser() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}

async function requestPasswordReset(usernameOrEmail) {
  let email = usernameOrEmail;
  if (!email.includes("@")) {
    email = await getEmailForUsername(usernameOrEmail);
    if (!email) {
      throw new Error("Fant ingen bruker med det brukernavnet.");
    }
  }

  const redirectTo = new URL("tilbakestill-passord.html", window.location.href)
    .href;
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

async function getCurrentProfile() {
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return null;

  const { data: profile, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) return null;
  if (!profile.approved) {
    await sb.auth.signOut();
    return null;
  }
  return profile;
}

async function initAuthNav() {
  const authLink = document.getElementById("auth-nav-link");
  const adminLink = document.getElementById("admin-nav-item");
  const dashboardLink = document.getElementById("dashboard-nav-item");
  if (!authLink) return;

  const profile = await getCurrentProfile();

  if (profile) {
    authLink.textContent = `Logg ut (${profile.username})`;
    authLink.href = "#";
    authLink.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });

    if (adminLink && profile.role === "admin") {
      adminLink.style.display = "";
    }
    if (dashboardLink) {
      dashboardLink.style.display = "";
    }
  } else {
    authLink.textContent = "Logg inn";
    authLink.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", initAuthNav);
