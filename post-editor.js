import { supabase } from "./auth.js";

const byId = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const editId = params.get("edit");
const editor = byId("editor-content");
const draftKey = (userId) => "portfolio-blog-draft:" + userId;
let currentUser = null;
let restoredRange = null;
let draftTimer = null;
let isEditing = Boolean(editId);
let mediaBusy = false;

function feedback(text, state="") {
  const node = byId("editor-feedback");
  node.textContent = text;
  node.dataset.state = state;
}
function mediaStatus(text, state="") {
  const node = byId("editor-media-status");
  node.textContent = text;
  node.dataset.state = state;
}
function textContentOf(html=editor.innerHTML) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  return (parsed.body.textContent || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function countWords(value) {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}
function updateCount() {
  const text = textContentOf();
  byId("editor-word-count").textContent = countWords(text).toLocaleString() + " words · " + text.length.toLocaleString() + " characters";
  scheduleDraft();
}
function scheduleDraft() {
  clearTimeout(draftTimer);
  byId("editor-save-state").textContent = "Unsaved changes";
  draftTimer = setTimeout(saveDraft, 650);
}
function saveDraft() {
  if (!currentUser) return;
  try {
    localStorage.setItem(draftKey(currentUser.id), JSON.stringify({
      title: byId("editor-title").value,
      author: byId("editor-author").value,
      html: editor.innerHTML,
      savedAt: Date.now()
    }));
    byId("editor-save-state").textContent = "Draft saved on this device";
  } catch {
    byId("editor-save-state").textContent = "Draft could not be saved";
  }
}
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey(currentUser.id)) || "null");
    if (!draft || !draft.savedAt || Date.now() - draft.savedAt > 30 * 24 * 60 * 60 * 1000) return;
    const hasContent = byId("editor-title").value || textContentOf();
    if (!hasContent && confirm("Restore your saved draft from this device?")) {
      byId("editor-title").value = draft.title || "";
      if (!isEditing && draft.author) byId("editor-author").value = draft.author;
      editor.innerHTML = draft.html || "";
      updateCount();
    }
  } catch {}
}
function captureSelection() {
  const selection = getSelection();
  if (selection?.rangeCount && editor.contains(selection.anchorNode)) restoredRange = selection.getRangeAt(0).cloneRange();
}
function restoreSelection() {
  editor.focus();
  const selection = getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  if (restoredRange && editor.contains(restoredRange.commonAncestorContainer)) selection.addRange(restoredRange);
  else {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  }
}
function insertNode(node) {
  restoreSelection();
  const selection = getSelection();
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  captureSelection();
  updateCount();
}
function allowedUrl(value) {
  try {
    const url = new URL(value, location.origin);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}
function sanitizeEditor(html = editor.innerHTML) {
  const source = new DOMParser().parseFromString(html || "", "text/html").body;
  const allowed = new Set(["P","DIV","BR","STRONG","B","EM","I","U","S","UL","OL","LI","BLOCKQUOTE","H2","H3","A","FIGURE","FIGCAPTION","IMG","VIDEO","SOURCE","TABLE","THEAD","TBODY","TR","TH","TD"]);
  const forbidden = new Set(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","FORM","INPUT"]);
  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    const tag = node.tagName;
    if (forbidden.has(tag)) return document.createDocumentFragment();
    const children = Array.from(node.childNodes).map(clean);
    if (!allowed.has(tag)) {
      const fragment = document.createDocumentFragment();
      children.forEach((child) => fragment.append(child));
      return fragment;
    }
    const element = document.createElement(tag.toLowerCase());
    children.forEach((child) => element.append(child));
    if (tag === "A") {
      const href = allowedUrl(node.getAttribute("href") || "");
      if (href) {
        element.href = href;
        element.target = "_blank";
        element.rel = "noreferrer noopener";
      }
    }
    if (tag === "IMG") {
      const src = node.getAttribute("src") || "";
      if (!src.startsWith("https://qnmdmsxxcxwzddomwkea.supabase.co/storage/v1/object/public/blog-images/")) return document.createDocumentFragment();
      element.src = src;
      element.alt = (node.getAttribute("alt") || "").slice(0, 240);
      element.loading = "lazy";
    }
    if (tag === "VIDEO") {
      element.controls = true;
      element.preload = "metadata";
      element.playsInline = true;
    }
    if (tag === "SOURCE") {
      const src = node.getAttribute("src") || "";
      if (!src.startsWith("https://qnmdmsxxcxwzddomwkea.supabase.co/storage/v1/object/public/blog-media/")) return document.createDocumentFragment();
      element.src = src;
      const type = node.getAttribute("type") || "";
      if (/^video\/(mp4|webm|quicktime)$/.test(type)) element.type = type;
    }
    return element;
  }
  return Array.from(source.childNodes).map(clean);
}
async function uploadMedia(file, kind) {
  if (!file || !currentUser) return;
  const imageTypes = ["image/jpeg","image/png","image/webp","image/gif"];
  const videoTypes = ["video/mp4","video/webm","video/quicktime"];
  const valid = (kind === "image" ? imageTypes : videoTypes).includes(file.type);
  if (!valid) return mediaStatus("Choose a supported " + kind + " file.", "error");
  const maxBytes = kind === "image" ? 1024 * 1024 : 6 * 1024 * 1024;
  if (file.size > maxBytes) return mediaStatus(kind === "image" ? "Each image must be 1 MB or smaller." : "Each video must be 6 MB or smaller.", "error");
  if (mediaBusy) return;
  mediaBusy = true;
  captureSelection();
  const attachButtons = document.querySelectorAll(".editor-attach-button");
  attachButtons.forEach((button) => { button.disabled = true; });
  mediaStatus("Uploading " + (kind === "image" ? "image" : "video") + "…");
  try {
    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-90) || "media";
    const path = currentUser.id + "/" + crypto.randomUUID() + "-" + safeName;
    const bucket = kind === "image" ? "blog-images" : "blog-media";
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const url = data.publicUrl;
    let node;
    if (kind === "image") {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      image.src = url;
      image.alt = file.name.replace(/\.[^.]+$/, "").slice(0, 240);
      image.loading = "lazy";
      const caption = document.createElement("figcaption");
      caption.contentEditable = "true";
      caption.textContent = "Add an image caption…";
      figure.append(image, caption);
      node = figure;
    } else {
      const figure = document.createElement("figure");
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      const source = document.createElement("source");
      source.src = url;
      source.type = file.type;
      video.append(source);
      const caption = document.createElement("figcaption");
      caption.contentEditable = "true";
      caption.textContent = "Add a video caption…";
      figure.append(video, caption);
      node = figure;
    }
    insertNode(node);
    mediaStatus((kind === "image" ? "Image" : "Video") + " attached.", "success");
  } catch {
    mediaStatus("Upload failed. Please retry after checking your connection and account verification.", "error");
  } finally {
    mediaBusy = false;
    attachButtons.forEach((button) => { button.disabled = false; });
  }
}
function toolbarCommand(command) {
  restoreSelection();
  if (command === "formatBlock") return;
  document.execCommand(command, false);
  captureSelection();
  updateCount();
}
document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => toolbarCommand(button.dataset.command));
});
byId("format-block").addEventListener("change", (event) => {
  restoreSelection();
  document.execCommand("formatBlock", false, "<" + event.target.value + ">");
  captureSelection();
  editor.focus();
  updateCount();
});
byId("insert-table").addEventListener("mousedown", (event) => event.preventDefault());
byId("insert-table").addEventListener("click", () => {
  const table = document.createElement("table");
  const body = document.createElement("tbody");
  for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
    const row = document.createElement("tr");
    for (let columnIndex = 0; columnIndex < 3; columnIndex += 1) {
      const cell = document.createElement(rowIndex === 0 ? "th" : "td");
      cell.textContent = rowIndex === 0 ? "Heading" : "Text";
      row.append(cell);
    }
    body.append(row);
  }
  table.append(body);
  insertNode(table);
});
byId("insert-link").addEventListener("mousedown", (event) => event.preventDefault());
byId("insert-link").addEventListener("click", () => {
  restoreSelection();
  const url = allowedUrl(prompt("Paste a web link (https://…).") || "");
  if (!url) return;
  document.execCommand("createLink", false, url);
  const selection = getSelection();
  const anchor = selection?.anchorNode?.parentElement?.closest("a");
  if (anchor) { anchor.target = "_blank"; anchor.rel = "noreferrer noopener"; }
  captureSelection();
  updateCount();
});
byId("attach-image").addEventListener("mousedown", (event) => event.preventDefault());
byId("attach-video").addEventListener("mousedown", (event) => event.preventDefault());
byId("attach-image").addEventListener("click", () => { captureSelection(); byId("image-file").click(); });
byId("attach-video").addEventListener("click", () => { captureSelection(); byId("video-file").click(); });
byId("image-file").addEventListener("change", async (event) => { await uploadMedia(event.target.files?.[0], "image"); event.target.value = ""; });
byId("video-file").addEventListener("change", async (event) => { await uploadMedia(event.target.files?.[0], "video"); event.target.value = ""; });
editor.addEventListener("input", updateCount);
editor.addEventListener("keyup", captureSelection);
editor.addEventListener("mouseup", captureSelection);
byId("editor-title").addEventListener("input", scheduleDraft);
byId("editor-author").addEventListener("input", scheduleDraft);
byId("save-draft").addEventListener("click", () => {
  saveDraft();
  feedback("Draft saved on this device.", "success");
});
byId("editor-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || mediaBusy) return;
  const title = byId("editor-title").value.trim();
  const authorName = byId("editor-author").value.trim();
  const cleanNodes = sanitizeEditor(editor.innerHTML);
  const cleanContainer = document.createElement("div");
  cleanNodes.forEach((node) => cleanContainer.append(node));
  const richContent = cleanContainer.innerHTML;
  const body = textContentOf(richContent);
  if (authorName.length < 2 || authorName.length > 50 || title.length < 5 || title.length > 160 || body.length < 20 || body.length > 12000) {
    feedback("Add a title (5–160 characters) and at least 20 characters of story text (up to 12,000).", "error");
    return;
  }
  const button = byId("publish-post");
  button.disabled = true;
  button.textContent = "Publishing…";
  try {
    const values = { title, author_name: authorName, body, rich_content: richContent };
    const result = editId
      ? await supabase.from("blog_posts").update(values).eq("id", editId)
      : await supabase.from("blog_posts").insert({ ...values, author_id: currentUser.id });
    if (result.error) throw result.error;
    try { localStorage.removeItem(draftKey(currentUser.id)); } catch {}
    feedback(editId ? "Your changes are saved." : "Your post is live.", "success");
    button.textContent = "Published";
    window.setTimeout(() => { location.assign("/blog.html#posts"); }, 900);
  } catch {
    feedback("Publishing failed. Check your verification and try again.", "error");
    button.disabled = false;
    button.innerHTML = 'Publish post <span aria-hidden="true">↗</span>';
  }
});
function redirectForSignIn() {
  const next = encodeURIComponent(location.pathname + location.search);
  location.replace("/login.html?mode=signin&next=" + next);
}
const { data: authData } = await supabase.auth.getSession();
currentUser = authData.session?.user || null;
if (!currentUser) redirectForSignIn();
else {
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || assurance.currentLevel !== "aal2") {
    feedback("Two-step verification is required to publish. Set it up or sign in again to complete verification.", "error");
    byId("publish-post").disabled = true;
    byId("save-draft").disabled = true;
    byId("editor-side-art")?.setAttribute("aria-hidden", "true");
    const hint = document.createElement("a");
    hint.className = "editor-mfa-link";
    hint.href = "/?auth=security";
    hint.textContent = "Open two-step verification settings ↗";
    byId("editor-feedback").after(hint);
  } else {
    const displayName = currentUser.user_metadata?.display_name || currentUser.email.split("@")[0];
    byId("editor-author").value = displayName.slice(0, 50);
    if (editId) {
      const { data: post, error: loadError } = await supabase.from("blog_posts").select("id,title,author_name,body,rich_content").eq("id", editId).single();
      if (loadError || !post) feedback("This post could not be opened for editing.", "error");
      else {
        byId("editor-title").value = post.title;
        byId("editor-author").value = post.author_name;
        const fallbackHtml = post.body.split("\\n").map((line) => "<p>" + line.replace(/[&<>]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[char])) + "</p>").join("");
        editor.replaceChildren(...sanitizeEditor(post.rich_content || fallbackHtml));
        byId("editor-heading").textContent = "Edit your post";
        byId("editor-mode-label").textContent = "Edit post";
        document.title = "Edit post — Raihan's Portfolio";
      }
    }
    restoreDraft();
    updateCount();
  }
}
