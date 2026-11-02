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
    card.className = "medium-story-card";
    if (story.image) {
      const imageLink = document.createElement("a");
      imageLink.className = "medium-story-image-link";
      imageLink.href = story.url;
      imageLink.target = "_blank";
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
    title.target = "_blank";
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
    readLink.target = "_blank";
    readLink.rel = "noreferrer";
    readLink.textContent = localized("read");
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
  async function loadFeed() {
    await waitForLanguage();
    containers.forEach((container) => showNotice(container, "loading", localized("loading")));
    try {
      const response = await fetch(feedEndpoint, { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error("Medium feed request failed.");
      const result = await response.json();
      const items = Array.isArray(result.items) ? result.items : [];
      containers.forEach((container) => {
        const limit = Number.parseInt(container.dataset.limit || "3", 10);
        const stories = items.slice(0, Number.isFinite(limit) ? limit : 3);
        if (!stories.length) {
          showNotice(container, "empty", localized("empty"));
          return;
        }
        container.replaceChildren(...stories.map(makeStory));
      });
    } catch {
      containers.forEach((container) => showNotice(container, "error", localized("error")));
    }
  }
  loadFeed();
})();
