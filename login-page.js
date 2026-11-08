import { supabase, signInWithPassword, challengeExistingSessionIfNeeded, verifyFactorChallenge, cancelPendingSignIn, isMfaPending } from "./auth.js";

const byId = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const mode = { value: params.get("mode") === "signup" ? "signup" : "signin" };
const safeNext = (() => {
  const raw = params.get("next") || "/";
  try {
    const url = new URL(raw, location.origin);
    return url.origin === location.origin ? url.pathname + url.search + url.hash : "/";
  } catch { return "/"; }
})();
let challenge = null;
let recoveryInProgress = false;
const messages = {
  signIn: "Sign in", signup: "Create account", welcome: "Welcome back", signupTitle: "Create your account",
  signInIntro: "Sign in to continue to your account.", signupIntro: "Create an account to join the portfolio community.",
  name: "Your name", email: "Email address", password: "Password", forgot: "Forgot password?",
  show: "Show", hide: "Hide", invalid: "Please check your email and password, then try again.",
  passwordLength: "Use a password with at least 8 characters.", emailFirst: "Enter your email address first.",
  resetSent: "If an account exists for this email, password reset instructions have been sent.",
  resetFailed: "We couldn’t send the reset email. Please try again.",
  signupSent: "Check your inbox to confirm your account, then sign in.",
  signedIn: "You’re signed in.", codeError: "That code didn’t work. Check it and try again.",
  recoveryFailed: "This reset link may have expired. Request a new reset email.",
  recoveryDone: "Your password has been updated. You can now sign in.",
  signOutFailed: "Could not sign out. Please try again."
};
function setMessage(node, text, state="") {
  node.textContent = text;
  node.dataset.state = state;
}
function setMode(nextMode) {
  mode.value = nextMode;
  byId("login-form").hidden = false;
  byId("mfa-form").hidden = true;
  byId("recovery-form").hidden = true;
  byId("signed-in-panel").hidden = true;
  byId("name-wrap").hidden = nextMode !== "signup";
  byId("name").required = nextMode === "signup";
  byId("password").autocomplete = nextMode === "signup" ? "new-password" : "current-password";
  byId("forgot-password").hidden = nextMode !== "signin";
  byId("submit-button").innerHTML = (nextMode === "signup" ? messages.signup : messages.signIn) + ' <span aria-hidden="true">↗</span>';
  byId("tab-signin").setAttribute("aria-selected", String(nextMode === "signin"));
  byId("tab-signup").setAttribute("aria-selected", String(nextMode === "signup"));
  byId("login-title").textContent = nextMode === "signup" ? messages.signupTitle : messages.welcome;
  byId("login-intro").textContent = nextMode === "signup" ? messages.signupIntro : messages.signInIntro;
  setMessage(byId("login-message"), "");
}
function showMfa(result) {
  challenge = result;
  byId("login-form").hidden = true;
  byId("mfa-form").hidden = false;
  byId("login-title").textContent = "Two-step verification";
  byId("login-intro").textContent = "Verify with the authenticator app connected to your account.";
  setMessage(byId("mfa-message"), "Enter the 6-digit code from your authenticator app.", "info");
  byId("mfa-code").value = "";
  byId("mfa-code").focus();
}
function showSignedIn(email) {
  byId("login-form").hidden = true;
  byId("mfa-form").hidden = true;
  byId("recovery-form").hidden = true;
  byId("signed-in-panel").hidden = false;
  byId("login-title").textContent = "You’re signed in";
  byId("login-intro").textContent = "";
  byId("signed-in-email").textContent = email || "";
  byId("continue-link").href = safeNext;
}
byId("tab-signin").addEventListener("click", () => setMode("signin"));
byId("tab-signup").addEventListener("click", () => setMode("signup"));
document.querySelectorAll("[data-toggle-password]").forEach((button) => button.addEventListener("click", () => {
  const input = byId(button.dataset.togglePassword);
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  button.textContent = visible ? messages.hide : messages.show;
  button.setAttribute("aria-pressed", String(visible));
}));
byId("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = byId("email").value.trim();
  const password = byId("password").value;
  if (password.length < 8) return setMessage(byId("login-message"), messages.passwordLength, "error");
  const button = byId("submit-button");
  button.disabled = true;
  try {
    if (mode.value === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: byId("name").value.trim() }, emailRedirectTo: location.origin + "/login.html" }
      });
      if (error) throw error;
      if (data.session?.user) showSignedIn(data.user?.email || email);
      else setMessage(byId("login-message"), messages.signupSent, "success");
    } else {
      const result = await signInWithPassword(email, password);
      if (result.requiresMfa) showMfa(result);
      else showSignedIn(result.user?.email || email);
    }
  } catch {
    setMessage(byId("login-message"), messages.invalid, "error");
  } finally { button.disabled = false; }
});
byId("forgot-password").addEventListener("click", async () => {
  const email = byId("email").value.trim();
  if (!email) {
    setMessage(byId("login-message"), messages.emailFirst, "error");
    byId("email").focus();
    return;
  }
  const button = byId("forgot-password");
  button.disabled = true;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/login.html" });
  button.disabled = false;
  setMessage(byId("login-message"), error ? messages.resetFailed : messages.resetSent, error ? "error" : "success");
});
byId("mfa-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!challenge) return;
  const button = byId("mfa-submit");
  button.disabled = true;
  try {
    await verifyFactorChallenge(challenge.factorId, challenge.challengeId, byId("mfa-code").value);
    challenge = null;
    const { data } = await supabase.auth.getUser();
    showSignedIn(data.user?.email);
    setMessage(byId("mfa-message"), messages.signedIn, "success");
  } catch {
    setMessage(byId("mfa-message"), messages.codeError, "error");
  } finally { button.disabled = false; }
});
byId("mfa-cancel").addEventListener("click", async () => {
  await cancelPendingSignIn();
  challenge = null;
  setMode("signin");
});
byId("recovery-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = byId("new-password").value;
  if (password.length < 8) return setMessage(byId("recovery-message"), messages.passwordLength, "error");
  const button = byId("recovery-submit");
  button.disabled = true;
  const { error } = await supabase.auth.updateUser({ password });
  button.disabled = false;
  if (error) return setMessage(byId("recovery-message"), messages.recoveryFailed, "error");
  recoveryInProgress = false;
  byId("recovery-form").hidden = true;
  setMode("signin");
  setMessage(byId("login-message"), messages.recoveryDone, "success");
});
byId("signout-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return setMessage(byId("login-message"), messages.signOutFailed, "error");
  setMode("signin");
});
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    recoveryInProgress = true;
    window.setTimeout(() => {
      byId("login-form").hidden = true;
      byId("mfa-form").hidden = true;
      byId("signed-in-panel").hidden = true;
      byId("recovery-form").hidden = false;
      byId("login-title").textContent = "Set a new password";
      byId("login-intro").textContent = "Choose a new password for this account.";
      byId("new-password").focus();
    }, 0);
    return;
  }
  window.setTimeout(async () => {
    if (isMfaPending() || recoveryInProgress || event === "SIGNED_OUT") return;
    if (event === "SIGNED_IN" && session?.user && !challenge) {
      try {
        const result = await challengeExistingSessionIfNeeded();
        if (result.requiresMfa) showMfa(result);
        else showSignedIn(session.user.email);
      } catch {}
    }
  }, 0);
});
setMode(mode.value);
byId("continue-link").href = safeNext;
const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session?.user) {
  try {
    const result = await challengeExistingSessionIfNeeded();
    if (result.requiresMfa) showMfa(result);
    else showSignedIn(sessionData.session.user.email);
  } catch { showSignedIn(sessionData.session.user.email); }
}