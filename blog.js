import { supabase, signInWithPassword, verifyFactorChallenge, challengeExistingSessionIfNeeded, cancelPendingSignIn, isMfaPending } from "./auth.js";

const byId = (id) => document.getElementById(id);
const strings = document.querySelector(".blog-translation-source");
const message = (id) => strings?.querySelector('[data-message="' + id + '"]')?.textContent.trim() || "";
const authForm = byId("auth-form");
const authSubmit = byId("auth-submit");
const authFeedback = byId("auth-feedback");
const challengeForm = byId("blog-mfa-challenge");
const challengeFeedback = byId("blog-mfa-feedback");
const mfaRequiredPanel = byId("blog-mfa-required");
const authTitle = byId("auth-form-title");
const authModeSwitch = byId("auth-mode-switch");
const signupNameField = byId("signup-name-field");
const accountActions = byId("account-actions");
const signedInCard = byId("signed-in-card");
const headerAuthOptions = byId("header-auth-options");
const headerUserStatus = byId("header-user-status");
const writerPanel = byId("write");
const postForm = byId("post-form");
const postFeedback = byId("post-feedback");
const postSubmit = byId("post-submit");
const postId = byId("post-id");
const postBody = byId("post-body");
const blogPosts = byId("blog-posts");
const countLabel = byId("post-count");
let authMode = "signin";
let currentUser = null;
let hasAal2 = false;
let pendingMfa = null;
let posts = [];

function setFeedback(element, text, state) {
  element.textContent = text || "";
  element.dataset.state = state || "";
}
function setAuthMode(mode) {
  authMode = mode;
  authForm.hidden = false;
  byId("password-recovery-form").hidden = true;
  byId("forgot-password").hidden = mode !== "signin";
  accountActions.hidden = true;
  signupNameField.hidden = mode !== "signup";
  byId("signup-name").required = mode === "signup";
  byId("auth-password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  authTitle.textContent = mode === "signup" ? message("signUp") : message("signIn");
  authSubmit.textContent = mode === "signup" ? message("createAccount") : message("signIn");
  authModeSwitch.textContent = mode === "signup" ? message("signInInstead") : message("createInstead");
  setFeedback(authFeedback, "");
  byId("auth-email").focus({ preventScroll: true });
}
function showAuth(mode) {
  setAuthMode(mode);
  byId("account-title").scrollIntoView({ behavior: "smooth", block: "center" });
}
function updateCount() {
  byId("character-count").textContent = postBody.value.length.toLocaleString(document.documentElement.lang) + " / 12,000";
}
function displayDate(value) {
  try {
    return new Intl.DateTimeFormat(document.documentElement.lang, { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleDateString();
  }
}
function renderPosts() {
  blogPosts.replaceChildren();
  countLabel.textContent = posts.length ? posts.length.toLocaleString(document.documentElement.lang) : "";
  if (!posts.length) {
    const empty = document.createElement("p");
    empty.className = "blog-empty";
    empty.textContent = message("empty");
    blogPosts.append(empty);
    return;
  }
  for (const post of posts) {
    const article = document.createElement("article");
    article.className = "blog-post";
    const title = document.createElement("h3");
    title.textContent = post.title;
    const meta = document.createElement("p");
    meta.className = "blog-post-meta";
    const author = document.createElement("span");
    author.textContent = post.author_name;
    meta.append(document.createTextNode(message("author") + " "), author, document.createTextNode(" · " + displayDate(post.created_at)));
    const body = document.createElement("p");
    body.className = "blog-post-body";
    body.textContent = post.body;
    article.append(title, meta, body);
    if (currentUser && hasAal2 && post.author_id === currentUser.id) {
      const actions = document.createElement("div");
      actions.className = "blog-post-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = message("edit");
      edit.addEventListener("click", () => editPost(post));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = message("delete");
      remove.addEventListener("click", () => deletePost(post));
      actions.append(edit, remove);
      article.append(actions);
    }
    blogPosts.append(article);
  }
}
async function loadPosts() {
  blogPosts.replaceChildren();
  const loading = document.createElement("p");
  loading.className = "blog-loading";
  loading.textContent = message("loading");
  blogPosts.append(loading);
  const { data, error } = await supabase.from("blog_posts").select("id,author_id,author_name,title,body,created_at").order("created_at", { ascending: false }).limit(50);
  if (error) {
    const notice = document.createElement("p");
    notice.className = "blog-error";
    notice.textContent = message("loadError");
    blogPosts.replaceChildren(notice);
    return;
  }
  posts = data || [];
  renderPosts();
}
function editPost(post) {
  postId.value = post.id;
  byId("post-author").value = post.author_name;
  byId("post-title").value = post.title;
  postBody.value = post.body;
  postSubmit.textContent = message("saveChanges");
  byId("cancel-edit").hidden = false;
  updateCount();
  writerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  byId("post-title").focus({ preventScroll: true });
}
function resetPostForm() {
  postForm.reset();
  postId.value = "";
  postSubmit.textContent = message("publish");
  byId("cancel-edit").hidden = true;
  setFeedback(postFeedback, "");
  updateCount();
}
async function deletePost(post) {
  if (!window.confirm(message("confirmDelete"))) return;
  const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
  if (error) {
    setFeedback(postFeedback, message("loadError"), "error");
    return;
  }
  setFeedback(postFeedback, message("deleted"), "success");
  await loadPosts();
}
async function setSignedInUser(user) {
  currentUser = user || null;
  if (!currentUser) {
    hasAal2 = false;
    headerAuthOptions.hidden = false;
    headerUserStatus.hidden = true;
    accountActions.hidden = false;
    authForm.hidden = true;
    challengeForm.hidden = true;
    signedInCard.hidden = true;
    writerPanel.hidden = true;
    mfaRequiredPanel.hidden = true;
    renderPosts();
    return;
  }
  const displayName = currentUser.user_metadata?.display_name || currentUser.email?.split("@")[0] || "Writer";
  headerAuthOptions.hidden = true;
  headerUserStatus.hidden = false;
  byId("header-user-name").textContent = displayName;
  accountActions.hidden = true;
  authForm.hidden = true;
  challengeForm.hidden = true;
  signedInCard.hidden = false;
  byId("signed-in-name").textContent = currentUser.email || displayName;
  try {
    const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    hasAal2 = !error && assurance.currentLevel === "aal2";
  } catch {
    hasAal2 = false;
  }
  writerPanel.hidden = !hasAal2;
  mfaRequiredPanel.hidden = hasAal2;
  const { data } = await supabase.from("blog_posts").select("author_name").eq("author_id", currentUser.id).order("created_at", { ascending: false }).limit(1);
  byId("post-author").value = data?.[0]?.author_name || displayName;
  renderPosts();
}
byId("show-signin").addEventListener("click", () => showAuth("signin"));
byId("show-signup").addEventListener("click", () => showAuth("signup"));
byId("account-signin").addEventListener("click", () => setAuthMode("signin"));
byId("account-signup").addEventListener("click", () => setAuthMode("signup"));
authModeSwitch.addEventListener("click", () => setAuthMode(authMode === "signin" ? "signup" : "signin"));
byId("header-signout").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) setFeedback(authFeedback, message("signoutSuccess"), "success");
});
byId("cancel-edit").addEventListener("click", resetPostForm);
postBody.addEventListener("input", updateCount);
byId("post-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) {
    showAuth("signin");
    return;
  }
  if (!hasAal2) {
    setFeedback(postFeedback, message("mfaPleaseEnable"), "error");
    mfaRequiredPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const authorName = byId("post-author").value.trim();
  const title = byId("post-title").value.trim();
  const body = postBody.value.trim();
  if (authorName.length < 2 || authorName.length > 50 || title.length < 5 || title.length > 160 || body.length < 20 || body.length > 12000) {
    setFeedback(postFeedback, message("invalidPost"), "error");
    return;
  }
  postSubmit.disabled = true;
  const values = { author_id: currentUser.id, author_name: authorName, title, body };
  const result = postId.value
    ? await supabase.from("blog_posts").update(values).eq("id", postId.value)
    : await supabase.from("blog_posts").insert(values);
  postSubmit.disabled = false;
  if (result.error) {
    setFeedback(postFeedback, message("loadError"), "error");
    return;
  }
  setFeedback(postFeedback, postId.value ? message("updated") : message("published"), "success");
  resetPostForm();
  await loadPosts();
});
byId("forgot-password").addEventListener("click", async () => {
  const email = byId("auth-email").value.trim();
  if (!email) {
    setFeedback(authFeedback, "Enter the email address you use to sign in first.", "error");
    byId("auth-email").focus();
    return;
  }
  byId("forgot-password").disabled = true;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/" });
  byId("forgot-password").disabled = false;
  setFeedback(authFeedback, error ? "We couldn’t send the reset email. Please try again." : "If an account exists for this sign-in email, password reset instructions have been sent.", error ? "error" : "success");
});
byId("password-recovery-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = byId("new-password").value;
  if (password.length < 8) {
    setFeedback(byId("recovery-feedback"), message("passwordLength"), "error");
    return;
  }
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  const { error } = await supabase.auth.updateUser({ password });
  button.disabled = false;
  if (error) {
    setFeedback(byId("recovery-feedback"), "This reset link may have expired. Request a new reset email.", "error");
    return;
  }
  setFeedback(byId("recovery-feedback"), "Your password has been updated.", "success");
  window.setTimeout(async () => {
    await supabase.auth.signOut();
    byId("password-recovery-form").hidden = true;
    await setSignedInUser(null);
    setAuthMode("signin");
  }, 1200);
});
document.querySelectorAll("[data-password-toggle]").forEach((button) => button.addEventListener("click", () => {
  const input = byId(button.dataset.passwordToggle);
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  button.textContent = visible ? "Hide" : "Show";
  button.setAttribute("aria-pressed", String(visible));
}));
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = byId("auth-email").value.trim();
  const password = byId("auth-password").value;
  if (password.length < 8) {
    setFeedback(authFeedback, message("passwordLength"), "error");
    return;
  }
  authSubmit.disabled = true;
  if (authMode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: byId("signup-name").value.trim() } }
    });
    authSubmit.disabled = false;
    if (error) {
      setFeedback(authFeedback, message("authError"), "error");
      return;
    }
    if (!data.session) {
      setFeedback(authFeedback, message("signupSuccess"), "success");
      return;
    }
    setFeedback(authFeedback, message("signinSuccess"), "success");
    await setSignedInUser(data.user || data.session.user);
    await loadPosts();
    return;
  }
  try {
    const result = await signInWithPassword(email, password);
    authSubmit.disabled = false;
    if (result.requiresMfa) {
      pendingMfa = result;
      authForm.hidden = true;
      challengeForm.hidden = false;
      byId("blog-mfa-code").focus({ preventScroll: true });
      return;
    }
    setFeedback(authFeedback, message("signinSuccess"), "success");
    await setSignedInUser(result.user);
    await loadPosts();
  } catch {
    authSubmit.disabled = false;
    setFeedback(authFeedback, message("authError"), "error");
  }
});
challengeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingMfa) return;
  byId("blog-mfa-submit").disabled = true;
  try {
    await verifyFactorChallenge(pendingMfa.factorId, pendingMfa.challengeId, byId("blog-mfa-code").value);
    pendingMfa = null;
    challengeForm.hidden = true;
    const { data } = await supabase.auth.getUser();
    await setSignedInUser(data.user || null);
    await loadPosts();
  } catch {
    setFeedback(challengeFeedback, message("mfaError"), "error");
  }
  byId("blog-mfa-submit").disabled = false;
});
byId("blog-mfa-cancel").addEventListener("click", async () => {
  await cancelPendingSignIn();
  pendingMfa = null;
  challengeForm.hidden = true;
  await setSignedInUser(null);
});
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    window.setTimeout(() => {
      accountActions.hidden = true;
      authForm.hidden = true;
      challengeForm.hidden = true;
      byId("password-recovery-form").hidden = false;
      byId("account-title").textContent = "Set a new password";
      byId("new-password").focus({ preventScroll: true });
    }, 0);
    return;
  }
  window.setTimeout(() => {
    if (isMfaPending()) return;
    void setSignedInUser(session?.user || null);
  }, 0);
});
const mobileMenuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
mobileMenuButton.addEventListener("click", () => {
  const expanded = mobileMenuButton.getAttribute("aria-expanded") === "true";
  mobileMenuButton.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("open", !expanded);
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  mobileMenuButton.setAttribute("aria-expanded", "false");
}));
byId("year").textContent = new Date().getFullYear();
updateCount();

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
await waitForLanguage();
authTitle.textContent = message("signIn");
authSubmit.textContent = message("signIn");
const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session?.user) {
  try {
    const challenge = await challengeExistingSessionIfNeeded();
    if (challenge.requiresMfa) {
      pendingMfa = challenge;
      authForm.hidden = true;
      challengeForm.hidden = false;
    } else {
      await setSignedInUser(sessionData.session.user);
    }
  } catch {
    await setSignedInUser(sessionData.session.user);
    setFeedback(authFeedback, message("authError"), "error");
  }
} else {
  await setSignedInUser(null);
}
await loadPosts();
