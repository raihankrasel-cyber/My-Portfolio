import {
  supabase,
  signInWithPassword,
  challengeExistingSessionIfNeeded,
  beginFactorChallenge,
  verifyFactorChallenge,
  cancelPendingSignIn,
  abandonMfaChallenge,
  enrollTotp,
  verifyTotpEnrollment,
  listTotpFactors,
  unenrollTotp,
  isMfaPending
} from "./auth.js";

const $ = (id) => document.getElementById(id);
const modal = $("front-auth-dialog");
const guest = $("front-auth-guest");
const account = $("front-auth-account");
const authForm = $("front-auth-form");
const codeForm = $("front-auth-code-form");
const enrollForm = $("front-auth-enroll-form");
const messages = document.querySelector(".front-auth-messages");
const msg = (id) => messages?.querySelector('[data-auth-message="' + id + '"]')?.textContent.trim() || "";
let authMode = "signin";
let currentUser = null;
let activeFactor = null;
let pendingAction = null;
let enrollmentFactorId = null;

function feedback(element, text, state) {
  element.textContent = text || "";
  element.dataset.state = state || "";
}
function updateHeader() {
  $("front-auth-actions").hidden = Boolean(currentUser);
  $("front-auth-account-button").hidden = !currentUser;
  $("front-auth-account-button").textContent = msg("account");
}
function showGuest(mode) {
  authMode = mode === "signup" ? "signup" : "signin";
  guest.hidden = false;
  account.hidden = true;
  codeForm.hidden = true;
  $("front-auth-recovery-form").hidden = true;
  authForm.hidden = false;
  $("front-auth-title").textContent = msg(authMode === "signup" ? "signUp" : "signIn");
  $("front-auth-name-wrap").hidden = authMode !== "signup";
  $("front-auth-name").required = authMode === "signup";
  $("front-auth-password").autocomplete = authMode === "signup" ? "new-password" : "current-password";
  $("front-auth-submit").textContent = msg(authMode === "signup" ? "createAccount" : "signIn");
  $("front-auth-forgot").hidden = authMode !== "signin";
  document.querySelectorAll("[data-front-auth-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.frontAuthMode === authMode);
    button.setAttribute("aria-selected", String(button.dataset.frontAuthMode === authMode));
  });
  feedback($("front-auth-feedback"), "");
}
function showChallenge(challenge, purpose) {
  pendingAction = { ...challenge, purpose };
  modal.hidden = false;
  guest.hidden = true;
  account.hidden = true;
  codeForm.hidden = false;
  $("front-auth-title").textContent = msg("twoFactor");
  $("front-auth-code-instructions").textContent = msg(purpose === "signin" ? "codeInstructions" : "disableCodeInstructions");
  $("front-auth-code-submit").textContent = msg("verifyCode");
  $("front-auth-code-cancel").textContent = msg("cancel");
  $("front-auth-code").value = "";
  feedback($("front-auth-code-feedback"), "");
  $("front-auth-code").focus({ preventScroll: true });
}
async function showAccount(user) {
  currentUser = user || null;
  const historyLink = $("front-auth-chat-history-link");
  if (historyLink) historyLink.hidden = currentUser?.email?.toLowerCase() !== "raihan.k.rasel@gmail.com";
  updateHeader();
  if (!currentUser) {
    account.hidden = true;
    guest.hidden = false;
    codeForm.hidden = true;
    showGuest("signin");
    return;
  }
  guest.hidden = true;
  codeForm.hidden = true;
  account.hidden = false;
  $("front-auth-title").textContent = msg("account");
  $("front-auth-user-email").textContent = currentUser.email || currentUser.user_metadata?.display_name || "";
  $("front-auth-mfa-status").textContent = msg("checkingMfa");
  await refreshSecurity();
}
async function refreshSecurity() {
  try {
    const factors = await listTotpFactors();
    activeFactor = factors[0] || null;
    $("front-auth-mfa-status").textContent = msg(activeFactor ? "mfaEnabled" : "mfaDisabled");
    $("front-auth-mfa-setup-button").hidden = Boolean(activeFactor);
    $("front-auth-mfa-disable-button").hidden = !activeFactor;
    $("front-auth-mfa-required").hidden = Boolean(activeFactor);
  } catch {
    activeFactor = null;
    $("front-auth-mfa-status").textContent = msg("mfaSetupFailed");
    $("front-auth-mfa-setup-button").hidden = false;
    $("front-auth-mfa-disable-button").hidden = true;
    $("front-auth-mfa-required").hidden = false;
  }
}
function openModal(mode) {
  modal.hidden = false;
  if (currentUser) {
    void showAccount(currentUser);
    return;
  }
  showGuest(mode || "signin");
  $("front-auth-email").focus({ preventScroll: true });
}
async function closeModal() {
  if (pendingAction?.purpose === "signin") {
    await cancelPendingSignIn();
    currentUser = null;
    updateHeader();
  } else if (pendingAction) {
    abandonMfaChallenge();
  }
  pendingAction = null;
  modal.hidden = true;
}
function qrImageSource(value) {
  if (value.startsWith("data:")) return value;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(value);
}
function waitForLanguage() {
  if (!document.documentElement.classList.contains("language-pending")) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains("language-pending")) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.setTimeout(() => { observer.disconnect(); resolve(); }, 38000);
  });
}
document.querySelectorAll("[data-front-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => showGuest(button.dataset.frontAuthMode));
});
const loginDestination = (mode) => "/login.html?mode=" + mode + "&next=" + encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
$("front-auth-signin").addEventListener("click", () => window.location.assign(loginDestination("signin")));
$("front-auth-signup").addEventListener("click", () => window.location.assign(loginDestination("signup")));
$("front-auth-account-button").addEventListener("click", () => openModal("security"));
$("front-auth-close").addEventListener("click", closeModal);
document.querySelectorAll("[data-front-auth-close]").forEach((element) => element.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) void closeModal();
});
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("front-auth-email").value.trim();
  const password = $("front-auth-password").value;
  if (password.length < 8) {
    feedback($("front-auth-feedback"), msg("passwordLength"), "error");
    return;
  }
  const submit = $("front-auth-submit");
  submit.disabled = true;
  if (authMode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: $("front-auth-name").value.trim() } }
    });
    submit.disabled = false;
    if (error) {
      feedback($("front-auth-feedback"), msg("authError"), "error");
      return;
    }
    if (data.session) {
      await showAccount(data.user || data.session.user);
    } else {
      feedback($("front-auth-feedback"), msg("signupSent"), "success");
    }
    return;
  }
  try {
    const result = await signInWithPassword(email, password);
    submit.disabled = false;
    if (result.requiresMfa) {
      showChallenge(result, "signin");
      feedback($("front-auth-code-feedback"), msg("signedInMfa"), "info");
      return;
    }
    await showAccount(result.user);
    feedback($("front-auth-security-feedback"), msg("signedIn"), "success");
  } catch {
    submit.disabled = false;
    feedback($("front-auth-feedback"), msg("authError"), "error");
  }
});
$("front-auth-forgot").addEventListener("click", async () => {
  const email = $("front-auth-email").value.trim();
  if (!email) {
    feedback($("front-auth-feedback"), document.documentElement.lang === "bn" ? "আগে আপনার ইমেইল লিখুন।" : "Enter your email address first.", "error");
    $("front-auth-email").focus();
    return;
  }
  const button = $("front-auth-forgot");
  button.disabled = true;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/" });
  button.disabled = false;
  feedback($("front-auth-feedback"), error
    ? (document.documentElement.lang === "bn" ? "রিসেট ইমেইল পাঠানো যায়নি। আবার চেষ্টা করুন।" : "We couldn’t send the reset email. Please try again.")
    : (document.documentElement.lang === "bn" ? "যদি এই ইমেইলে অ্যাকাউন্ট থাকে, পাসওয়ার্ড রিসেটের নির্দেশনা পাঠানো হয়েছে।" : "If an account exists for this email, password reset instructions have been sent."), error ? "error" : "success");
});
$("front-auth-recovery-back").addEventListener("click", () => {
  $("front-auth-recovery-form").hidden = true;
  guest.hidden = false;
  showGuest("signin");
});
$("front-auth-recovery-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = $("front-auth-new-password").value;
  const feedbackNode = $("front-auth-recovery-feedback");
  if (password.length < 8) {
    feedback(feedbackNode, msg("passwordLength") || "Use at least 8 characters.", "error");
    return;
  }
  const submit = event.currentTarget.querySelector('[type="submit"]');
  submit.disabled = true;
  const { error } = await supabase.auth.updateUser({ password });
  submit.disabled = false;
  if (error) {
    feedback(feedbackNode, document.documentElement.lang === "bn" ? "লিংকটি মেয়াদোত্তীর্ণ হতে পারে। নতুন রিসেট ইমেইল নিন।" : "This reset link may have expired. Request a new reset email.", "error");
    return;
  }
  feedback(feedbackNode, document.documentElement.lang === "bn" ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।" : "Your password has been updated.", "success");
  window.setTimeout(() => { void supabase.auth.signOut(); closeModal(); }, 1200);
});
document.querySelectorAll("[data-password-toggle]").forEach((button) => button.addEventListener("click", () => {
  const input = $(button.dataset.passwordToggle);
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  button.textContent = visible ? (document.documentElement.lang === "bn" ? "লুকান" : "Hide") : (document.documentElement.lang === "bn" ? "দেখান" : "Show");
  button.setAttribute("aria-pressed", String(visible));
}));
codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingAction) return;
  const submit = $("front-auth-code-submit");
  submit.disabled = true;
  try {
    await verifyFactorChallenge(pendingAction.factorId, pendingAction.challengeId, $("front-auth-code").value);
    if (pendingAction.purpose === "disable") {
      await unenrollTotp(pendingAction.factorId);
      pendingAction = null;
      codeForm.hidden = true;
      await showAccount(currentUser);
      feedback($("front-auth-security-feedback"), msg("mfaNowDisabled"), "success");
    } else {
      const user = currentUser || (await supabase.auth.getUser()).data.user;
      pendingAction = null;
      await showAccount(user);
      feedback($("front-auth-security-feedback"), msg("signedIn"), "success");
    }
  } catch {
    feedback($("front-auth-code-feedback"), msg("mfaVerifyFailed"), "error");
  }
  submit.disabled = false;
});
$("front-auth-code-cancel").addEventListener("click", async () => {
  if (pendingAction?.purpose === "signin") {
    await cancelPendingSignIn();
    currentUser = null;
    updateHeader();
    showGuest("signin");
  } else {
    abandonMfaChallenge();
    pendingAction = null;
    await showAccount(currentUser);
  }
});
$("front-auth-mfa-setup-button").addEventListener("click", async () => {
  const button = $("front-auth-mfa-setup-button");
  button.disabled = true;
  feedback($("front-auth-security-feedback"), "");
  try {
    const factor = await enrollTotp();
    enrollmentFactorId = factor.id;
    $("front-auth-qr").src = qrImageSource(factor.totp.qr_code);
    $("front-auth-secret").textContent = factor.totp.secret;
    enrollForm.hidden = false;
    $("front-auth-enroll-code").focus({ preventScroll: true });
  } catch {
    feedback($("front-auth-security-feedback"), msg("mfaSetupFailed"), "error");
  }
  button.disabled = false;
});
enrollForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!enrollmentFactorId) return;
  $("front-auth-enroll-submit").disabled = true;
  try {
    await verifyTotpEnrollment(enrollmentFactorId, $("front-auth-enroll-code").value);
    enrollmentFactorId = null;
    enrollForm.reset();
    enrollForm.hidden = true;
    await refreshSecurity();
    feedback($("front-auth-security-feedback"), msg("mfaNowEnabled"), "success");
  } catch {
    feedback($("front-auth-security-feedback"), msg("mfaVerifyFailed"), "error");
  }
  $("front-auth-enroll-submit").disabled = false;
});
$("front-auth-enroll-cancel").addEventListener("click", async () => {
  if (enrollmentFactorId) {
    try { await unenrollTotp(enrollmentFactorId); } catch {}
  }
  enrollmentFactorId = null;
  enrollForm.hidden = true;
  enrollForm.reset();
  await refreshSecurity();
});
$("front-auth-mfa-disable-button").addEventListener("click", async () => {
  if (!activeFactor || !window.confirm(msg("mfaDisableConfirm"))) return;
  try {
    const challenge = await beginFactorChallenge(activeFactor.id);
    showChallenge(challenge, "disable");
  } catch {
    feedback($("front-auth-security-feedback"), msg("mfaDisableFailed"), "error");
  }
});
$("front-auth-signout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  currentUser = null;
  updateHeader();
  showGuest("signin");
});
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    window.setTimeout(() => {
      modal.hidden = false;
      guest.hidden = true;
      account.hidden = true;
      codeForm.hidden = true;
      $("front-auth-recovery-form").hidden = false;
      $("front-auth-title").textContent = document.documentElement.lang === "bn" ? "নতুন পাসওয়ার্ড সেট করুন" : "Set a new password";
      $("front-auth-new-password").focus({ preventScroll: true });
    }, 0);
    return;
  }
  window.setTimeout(() => {
    if (isMfaPending()) return;
    const user = session?.user || null;
    currentUser = user;
    updateHeader();
    if (!modal.hidden && user) void showAccount(user);
    else if (!user && !modal.hidden) showGuest("signin");
  }, 0);
});

await waitForLanguage();
updateHeader();
const query = new URL(window.location.href);
const requestedMode = query.searchParams.get("auth");
const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session?.user) {
  try {
    const mfaState = await challengeExistingSessionIfNeeded();
    if (mfaState.requiresMfa) {
      openModal("signin");
      showChallenge(mfaState, "signin");
      feedback($("front-auth-code-feedback"), msg("sessionMfa"), "info");
    } else {
      currentUser = sessionData.session.user;
      updateHeader();
      if (requestedMode === "security") {
        modal.hidden = false;
        await showAccount(currentUser);
      }
    }
  } catch {
    currentUser = sessionData.session.user;
    updateHeader();
    if (requestedMode === "security") {
      modal.hidden = false;
      await showAccount(currentUser);
      feedback($("front-auth-security-feedback"), msg("authError"), "error");
    }
  }
}
if (!currentUser && requestedMode) openModal(requestedMode === "signup" ? "signup" : "signin");
if (requestedMode) {
  query.searchParams.delete("auth");
  window.history.replaceState({}, "", query.toString());
}
