import { supabase, signInWithPassword, challengeExistingSessionIfNeeded, verifyFactorChallenge, cancelPendingSignIn, isMfaPending } from "./auth.js";

const byId = (id) => document.getElementById(id);

const loginCard = document.querySelector(".login-card");
if (loginCard) loginCard.insertAdjacentHTML("beforebegin", "<section class=\"login-showcase\" aria-label=\"Interactive digital marketing artwork\">\n  <div class=\"showcase-topline\"><span class=\"showcase-status\"><i></i> DIGITAL MARKETING</span><span>01 / 03</span></div>\n  <div class=\"showcase-copy\"><p>Strategy in motion</p><h2>Turn good ideas<br>into <em>real growth.</em></h2><span>Creative thinking, meaningful data, measurable progress.</span></div>\n  <div class=\"login-art\" id=\"login-art\">\n    <div class=\"art-halo art-halo-one\"></div><div class=\"art-halo art-halo-two\"></div><div class=\"art-grid\"></div>\n    <div class=\"art-chart-card\"><div class=\"art-chart-head\"><span>Campaign growth</span><span class=\"art-chart-period\">● LIVE</span></div>\n      <div class=\"art-chart-summary\"><strong id=\"art-value\">+38.6%</strong><span>this quarter <b>↗</b></span></div>\n      <svg class=\"growth-chart\" viewBox=\"0 0 520 190\" role=\"img\" aria-label=\"Illustrated upward growth chart\">\n        <defs><linearGradient id=\"area-fill\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#7c67f3\" stop-opacity=\".42\"/><stop offset=\"1\" stop-color=\"#4268f1\" stop-opacity=\"0\"/></linearGradient><linearGradient id=\"line-fill\" x1=\"0\" x2=\"1\"><stop stop-color=\"#a593ff\"/><stop offset=\"1\" stop-color=\"#45d6c8\"/></linearGradient></defs>\n        <path class=\"chart-gridline\" d=\"M20 30H500M20 75H500M20 120H500M20 165H500\"/>\n        <path class=\"chart-area\" id=\"chart-area\" d=\"M20 151 C72 140 85 117 126 126 S188 145 232 98 S302 105 344 72 S422 77 500 25 V180 H20Z\"/>\n        <path class=\"chart-line\" id=\"chart-line\" d=\"M20 151 C72 140 85 117 126 126 S188 145 232 98 S302 105 344 72 S422 77 500 25\"/>\n        <circle class=\"chart-point\" cx=\"500\" cy=\"25\" r=\"5\"/>\n      </svg><div class=\"chart-axis\"><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span></div>\n    </div>\n    <div class=\"float-card float-traffic\"><span class=\"float-icon\">↗</span><span><small>QUALIFIED REACH</small><b>24.8K</b></span><i>+18%</i></div>\n    <div class=\"float-card float-conversion\"><span class=\"conversion-donut\"><i></i></span><span><small>CONVERSION</small><b>4.82%</b></span></div>\n    <div class=\"art-spark spark-one\">✳</div><div class=\"art-spark spark-two\">✦</div>\n  </div>\n  <div class=\"showcase-footer\"><div class=\"showcase-dots\" aria-hidden=\"true\"><i class=\"active\"></i><i></i><i></i></div><button id=\"art-next\" class=\"art-next\" type=\"button\" aria-label=\"Show another campaign insight\">Explore insights <span aria-hidden=\"true\">↗</span></button></div>\n</section>");

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
let manualAuthInProgress = false;
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
  manualAuthInProgress = true;
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
  } finally { button.disabled = false; manualAuthInProgress = false; }
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
    if (isMfaPending() || recoveryInProgress || manualAuthInProgress || event === "SIGNED_OUT") return;
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
const artNext = byId("art-next");
if (artNext) {
  const insights = [
    { value: "+38.6%", line: "M20 151 C72 140 85 117 126 126 S188 145 232 98 S302 105 344 72 S422 77 500 25" },
    { value: "+24.2%", line: "M20 158 C65 145 93 152 126 117 S193 131 232 85 S303 91 344 60 S421 58 500 20" },
    { value: "+51.8%", line: "M20 163 C69 150 93 123 126 138 S190 102 232 110 S300 65 344 78 S423 49 500 15" }
  ];
  let index = 0;
  artNext.addEventListener("click", () => {
    index = (index + 1) % insights.length;
    const insight = insights[index];
    byId("art-value").textContent = insight.value;
    byId("chart-line").setAttribute("d", insight.line);
    byId("chart-area").setAttribute("d", insight.line + " V180 H20Z");
    document.querySelectorAll(".showcase-dots i").forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    const art = byId("login-art");
    art.classList.remove("art-refresh");
    void art.offsetWidth;
    art.classList.add("art-refresh");
  });
}
const art = byId("login-art");
if (art && matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  art.addEventListener("pointermove", (event) => {
    const rect = art.getBoundingClientRect();
    art.style.setProperty("--tilt-x", (((event.clientX - rect.left) / rect.width - .5) * 3).toFixed(2) + "deg");
    art.style.setProperty("--tilt-y", -(((event.clientY - rect.top) / rect.height - .5) * 3).toFixed(2) + "deg");
  });
  art.addEventListener("pointerleave", () => {
    art.style.setProperty("--tilt-x", "0deg");
    art.style.setProperty("--tilt-y", "0deg");
  });
}
