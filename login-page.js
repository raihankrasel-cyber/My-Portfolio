import { supabase, signInWithPassword, challengeExistingSessionIfNeeded, verifyFactorChallenge, cancelPendingSignIn, isMfaPending } from "./auth.js";

const byId = (id) => document.getElementById(id);

const loginCard = document.querySelector(".login-card");
if (loginCard) loginCard.insertAdjacentHTML("beforebegin", `
<section class="login-showcase" aria-label="Interactive desk lamp artwork">
  <div class="showcase-topline"><span class="showcase-status"><i></i> A BRIGHTER WAY FORWARD</span><span>RAIHAN'S PORTFOLIO</span></div>
  <div class="showcase-copy"><p>Ideas start with a spark</p><h2>Make room<br>for <em>bright ideas.</em></h2><span>Creative thinking, meaningful data, measurable progress.</span></div>
  <div class="login-art" id="login-art" data-lamp-state="off" data-lamp-color="amber">
    <div class="art-halo art-halo-one"></div><div class="art-halo art-halo-two"></div><div class="art-grid"></div>
    <div class="lamp-backlight" aria-hidden="true"></div>
    <svg class="desk-lamp" viewBox="0 0 460 350">
      <defs>
        <radialGradient id="lamp-beam-fill"><stop id="lamp-beam-core" offset="0" stop-color="#9e8aff" stop-opacity=".58"/><stop id="lamp-beam-edge" offset="1" stop-color="#6b59d9" stop-opacity="0"/></radialGradient>
        <linearGradient id="lamp-shade-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#333c55"/><stop offset="1" stop-color="#101522"/></linearGradient>
        <filter id="lamp-glow-blur"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <ellipse class="lamp-beam" cx="190" cy="203" rx="92" ry="105" fill="url(#lamp-beam-fill)" filter="url(#lamp-glow-blur)"/>
      <path class="lamp-light-cone" d="M177 105 L316 277 L64 277Z" fill="url(#lamp-beam-fill)"/>
      <ellipse class="lamp-floor-shadow" cx="191" cy="303" rx="94" ry="13"/>
      <ellipse class="lamp-base" cx="191" cy="294" rx="69" ry="12"/>
      <ellipse class="lamp-base-top" cx="191" cy="291" rx="54" ry="7"/>
      <path class="lamp-lower-arm" d="M190 284 L159 174"/>
      <g class="lamp-moving-arm">
        <path class="lamp-upper-arm" d="M159 174 L193 115"/>
        <circle class="lamp-joint" cx="159" cy="174" r="9"/><circle class="lamp-joint-core" cx="159" cy="174" r="3"/>
        <circle class="lamp-joint" cx="193" cy="115" r="7"/><circle class="lamp-joint-core" cx="193" cy="115" r="2.5"/>
        <g class="lamp-head">
          <path d="M154 76 Q158 42 194 39 Q230 42 234 76 L251 111 Q195 131 137 111Z" fill="url(#lamp-shade-fill)" stroke="#8791aa" stroke-opacity=".5" stroke-width="2"/>
          <path class="lamp-shade-rim" d="M137 111 Q195 131 251 111" fill="none" stroke="#b6a6ff" stroke-width="4" stroke-linecap="round"/>
          <ellipse class="lamp-bulb" cx="194" cy="108" rx="34" ry="9"/>
        </g>
      </g>
      <g class="lamp-pull" id="lamp-pull" role="button" tabindex="0" aria-label="Pull chain to turn the light on" aria-pressed="false">
        <circle class="lamp-pull-hit-area" cx="246" cy="141" r="16"/>
        <path class="lamp-pull-chain" d="M242 112 C249 122 250 132 246 141"/>
        <circle class="lamp-pull-knob" cx="246" cy="147" r="5"/>
      </g>
      <circle class="lamp-pivot" cx="190" cy="284" r="8"/>
      <ellipse class="lamp-floor-glow" cx="191" cy="285" rx="76" ry="10"/>
    </svg>
    <span class="lamp-spark lamp-spark-one" aria-hidden="true">✦</span><span class="lamp-spark lamp-spark-two" aria-hidden="true">✳</span>
  </div>
  <div class="lamp-caption"><span aria-hidden="true">✧</span> A little light can change your perspective.</div>
</section>`);
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

const art = byId("login-art");
const lampControl = byId("lamp-pull");
const lampColorSettings = {
  violet: { core:"#aebcff", edge:"#5269d7", tone:"#7488ef", highlight:"#e9efff", spark:"#c3ceff", button:"#8191f5" },
  rose: { core:"#ff86c9", edge:"#d64293", tone:"#f25bb9", highlight:"#ffe1f2", spark:"#ff9bd5", button:"#f25bb9" },
  amber: { core:"#ffe09a", edge:"#d89434", tone:"#f5b84d", highlight:"#fff0c4", spark:"#ffd780", button:"#ffb52e" }
};
const setLampColor = (colorName) => {
  const colors = lampColorSettings[colorName];
  if (!colors || !art) return;
  art.dataset.lampColor = colorName;
  art.style.setProperty("--lamp-tone", colors.tone);
  art.style.setProperty("--lamp-highlight", colors.highlight);
  art.style.setProperty("--lamp-spark-color", colors.spark);
  document.getElementById("lamp-beam-core")?.setAttribute("stop-color", colors.core);
  document.getElementById("lamp-beam-edge")?.setAttribute("stop-color", colors.edge);
  document.body.style.setProperty("--lamp-ambient-color", colors.tone);
  document.body.style.setProperty("--lamp-button-tone", colors.button);
};
setLampColor("amber");
if (art && lampControl) {
  let lampWasManuallySet = false;
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let turnOnTimer = 0;
  let colorCycleTimer = 0;
  let colorIndex = 0;
  const colorCycle = ["amber", "rose", "violet"];

  const playLampHum = () => {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return;
    try {
      const audioContext = new AudioContextType();
      const hum = audioContext.createOscillator();
      const humGain = audioContext.createGain();
      const now = audioContext.currentTime;
      hum.type = "sine";
      hum.frequency.setValueAtTime(120, now + 0.05);
      humGain.gain.setValueAtTime(0, now);
      humGain.gain.linearRampToValueAtTime(0.012, now + 0.08);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      hum.connect(humGain);
      humGain.connect(audioContext.destination);
      hum.start(now + 0.05);
      hum.stop(now + 0.35);
      hum.addEventListener("ended", () => { void audioContext.close(); }, { once: true });
    } catch {}
  };
  const setLampState = (isOn) => {
    art.dataset.lampState = isOn ? "on" : "off";
    document.body.classList.toggle("lamp-lit", isOn);
    lampControl.setAttribute("aria-pressed", String(isOn));
    lampControl.setAttribute("aria-label", isOn ? "Pull chain to turn the light off" : "Pull chain to turn the light on");
  };
  const stopColorCycle = () => window.clearInterval(colorCycleTimer);
  const startColorCycle = () => {
    if (prefersReducedMotion) return;
    stopColorCycle();
    colorCycleTimer = window.setInterval(() => {
      if (art.dataset.lampState !== "on") return;
      colorIndex = (colorIndex + 1) % colorCycle.length;
      setLampColor(colorCycle[colorIndex]);
    }, 2500);
  };
  const toggleLamp = () => {
    lampWasManuallySet = true;
    window.clearTimeout(turnOnTimer);
    const isOn = lampControl.getAttribute("aria-pressed") !== "true";
    if (isOn) playLampHum();
    setLampState(isOn);
    if (isOn) startColorCycle();
    else stopColorCycle();
  };
  lampControl.addEventListener("click", toggleLamp);
  lampControl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleLamp();
  });

  if (prefersReducedMotion) {
    setLampColor("violet");
    setLampState(true);
  } else {
    turnOnTimer = window.setTimeout(() => {
      if (!lampWasManuallySet) {
        setLampState(true);
        startColorCycle();
      }
    }, 1800);
  }
}
