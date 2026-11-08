import { supabase } from "./auth.js";
(function () {
  "use strict";
  const SUPABASE_URL = "https://qnmdmsxxcxwzddomwkea.supabase.co";
  const feedEndpoint = SUPABASE_URL + "/functions/v1/medium-feed";
  const containers = Array.from(document.querySelectorAll("[data-medium-feed]"));
  if (!containers.length) return;
  const sources = document.querySelector(".medium-feed-source");
  const localized = (name) => sources?.querySelector('[data-medium-message="' + name + '"]')?.textContent.trim() || "";
  const formatDate = (value) => {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang, { dateStyle: "medium" }).format(new Date(value));
    } catch {
      return "";
    }
  };
  const makeStory = (story) => {
    const card = document.createElement("article");
    card.className = story.localPost ? "medium-story-card medium-story-card-local" : "medium-story-card";
    if (story.image) {
      const imageLink = document.createElement("a");
      imageLink.className = "medium-story-image-link";
      imageLink.href = story.url;
      if (!story.localPost) imageLink.target = "_blank";
      imageLink.rel = "noreferrer";
      imageLink.setAttribute("aria-label", story.title);
      const image = document.createElement("img");
      image.className = "medium-story-image";
      image.src = story.image;
      image.alt = "";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      imageLink.append(image);
      card.append(imageLink);
    }
    const content = document.createElement("div");
    content.className = "medium-story-content";
    const meta = document.createElement("p");
    meta.className = "medium-story-meta";
    meta.textContent = [story.author, formatDate(story.publishedAt)].filter(Boolean).join(" · ");
    const title = document.createElement("a");
    title.className = "medium-story-title";
    title.href = story.url;
    if (!story.localPost) title.target = "_blank";
    title.rel = "noreferrer";
    title.textContent = story.title;
    content.append(meta, title);
    if (story.excerpt) {
      const excerpt = document.createElement("p");
      excerpt.className = "medium-story-excerpt";
      excerpt.textContent = story.excerpt;
      content.append(excerpt);
    }
    const readLink = document.createElement("a");
    readLink.className = "medium-story-read";
    readLink.href = story.url;
    if (!story.localPost) readLink.target = "_blank";
    readLink.rel = "noreferrer";
    readLink.textContent = localized(story.localPost ? "readBlog" : "read");
    content.append(readLink);
    card.append(content);
    return card;
  };
  const showNotice = (container, type, text) => {
    const notice = document.createElement("p");
    notice.className = "medium-feed-status medium-feed-" + type;
    notice.textContent = text;
    container.replaceChildren(notice);
  };
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
  function newestPostImage(markup) {
    try {
      const parsed = new DOMParser().parseFromString(markup || "", "text/html");
      const src = parsed.querySelector("img")?.getAttribute("src") || "";
      const url = new URL(src);
      if (url.origin === "https://qnmdmsxxcxwzddomwkea.supabase.co" && url.pathname.startsWith("/storage/v1/object/public/blog-images/")) return url.href;
    } catch {}
    return "";
  }
  async function loadFeed() {
    await waitForLanguage();
    containers.forEach((container) => showNotice(container, "loading", localized("loading")));
    const [mediumResult, postResult] = await Promise.allSettled([
      fetch(feedEndpoint, { headers: { "Accept": "application/json" } }).then(async (response) => {
        if (!response.ok) throw new Error("Medium feed request failed.");
        return response.json();
      }),
      supabase.from("blog_posts").select("author_name,title,body,rich_content,created_at").order("created_at", { ascending: false }).limit(12)
    ]);
    const mediumFailed = mediumResult.status === "rejected";
    const items = mediumResult.status === "fulfilled" && Array.isArray(mediumResult.value.items) ? mediumResult.value.items : [];
    const localPosts = postResult.status === "fulfilled" && !postResult.value.error && Array.isArray(postResult.value.data)
      ? postResult.value.data.map((post) => ({
        localPost: true,
        author: post.author_name,
        publishedAt: post.created_at,
        title: post.title,
        excerpt: post.body,
        image: newestPostImage(post.rich_content),
        url: "/blog.html#posts"
      }))
      : [];
    const newestFirst = [...localPosts, ...items].sort((a, b) => {
      const dateA = Date.parse(a.publishedAt || "") || 0;
      const dateB = Date.parse(b.publishedAt || "") || 0;
      return dateB - dateA;
    });
    containers.forEach((container) => {
      const limitValue = Number.parseInt(container.dataset.limit || "3", 10);
      const limit = Number.isFinite(limitValue) ? limitValue : 3;
      const cards = newestFirst.slice(0, Math.max(0, limit)).map(makeStory);
      if (cards.length) {
        container.replaceChildren(...cards);
        return;
      }
      showNotice(container, mediumFailed ? "error" : "empty", localized(mediumFailed ? "error" : "empty"));
    });
  }
  loadFeed();
})();
