(function () {
  "use strict";

  const languages = [
    { code: "en", label: "English", name: "English" },
    { code: "bn", label: "বাংলা", name: "Bengali" }
  ];
  const languageByCode = new Map(languages.map((item) => [item.code, item]));
  const sourceLanguage = document.documentElement.dataset.baseLanguage || "en";
  const currentLanguage = document.documentElement.dataset.siteLanguage || sourceLanguage;
  const dialog = document.getElementById("language-dialog");
  const dialogOptions = document.getElementById("language-dialog-options");
  const menu = document.getElementById("language-menu-options");
  const menuToggle = document.getElementById("language-toggle");
  const currentLabel = document.getElementById("current-language-label");
  const choiceKey = "portfolio-language-choice";
  const cachePrefix = "portfolio-page-translations-v2:";
  const sourceToTranslation = new Map();
  const dynamicPairs = [
    ["Image you sent", "আপনার পাঠানো ছবি"],
    ["🔊 Listen", "🔊 শুনুন"],
    ["Read this reply aloud", "উত্তরটি পড়ে শোনান"],
    ["Choose a JPG, PNG, or WebP image under 8 MB.", "৮ MB-এর মধ্যে JPG, PNG বা WebP ছবি বেছে নিন।"],
    ["Could not read that image.", "ছবিটি পড়া যায়নি।"],
    ["Could not open that image.", "ছবিটি খোলা যায়নি।"],
    ["That image is still too large. Please choose a smaller image.", "ছবিটি খুব বড়। আরও ছোট ছবি ব্যবহার করুন।"],
    ["Replying…", "অপেক্ষা করুন"],
    ["Send", "পাঠান"],
    ["Waiting for reply", "উত্তরের অপেক্ষায়"],
    ["Send message", "বার্তা পাঠান"],
    ["Voice input is paused. I’ll check automatically and show it again when it’s available.", "ভয়েস ইনপুট সাময়িক বন্ধ—সীমা উঠলে নিজে থেকেই ফিরবে।"],
    ["Voice input is available again.", "ভয়েস ইনপুট আবার চালু হয়েছে।"],
    ["What can you tell me about this image?", "এই ছবিটি সম্পর্কে বলুন।"],
    ["That took longer than expected. Please try again.", "উত্তর পেতে একটু বেশি সময় লাগছে। আবার চেষ্টা করুন।"],
    ["Sorry, I couldn’t get a reply just now. Please try again shortly.", "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।"],
    ["Open chat full screen", "চ্যাট পূর্ণপর্দায় খুলুন"],
    ["Exit full screen", "পূর্ণপর্দা বন্ধ করুন"],
    ["Fullscreen", "পূর্ণপর্দা"],
    ["Close chat", "চ্যাট বন্ধ করুন"],
    ["Let’s chat", "চলুন কথা বলি"],
    ["Hey! What are you working on? Tell me a little, and we’ll figure out a good next step together.", "আসসালামু আলাইকুম! কী নিয়ে কাজ করছেন একটু বলুন—একসঙ্গে ভেবে ভালো পরবর্তী পদক্ষেপ খুঁজে দেখি।"],
    ["🎙 Voice", "🎙 ভয়েস"],
    ["Voice recording isn’t supported in this browser.", "এই ব্রাউজারে ভয়েস রেকর্ডিং সমর্থিত নয়।"],
    ["Recording failed.", "রেকর্ডিং ব্যর্থ হয়েছে।"],
    ["Recording is over 10 MB. Please record a shorter message.", "রেকর্ডিংটি ১০ MB-এর বেশি। ছোট করে বলুন।"],
    ["Transcribing your voice…", "কথা লিখে নেওয়া হচ্ছে…"],
    ["Transcribed—edit it if you like, then send.", "কথাটি লিখে দেওয়া হয়েছে—পাঠানোর আগে সম্পাদনা করুন।"],
    ["Voice transcription is temporarily unavailable because the AI service is at its usage limit. Please type your message or try again shortly.", "AI ব্যবহারের সাময়িক সীমার কারণে ভয়েস লেখা যাচ্ছে না। বার্তাটি টাইপ করুন বা কিছুক্ষণ পর চেষ্টা করুন।"],
    ["Unsupported audio format", "অসমর্থিত অডিও ফরম্যাট"],
    ["I couldn’t transcribe that. Please try again.", "কথা লিখে নেওয়া যায়নি। আবার চেষ্টা করুন।"],
    ["Stop", "থামান"],
    ["Recording… up to 15 seconds", "রেকর্ড হচ্ছে… সর্বোচ্চ ১৫ সেকেন্ড"],
    ["Allow microphone access to record a message.", "ভয়েস বার্তা রেকর্ড করতে মাইক্রোফোন ব্যবহারের অনুমতি দিন।"],
    ["Choose language", "ভাষা বেছে নিন"],
    ["Translation unavailable. Please choose a language to try again.", "অনুবাদ পাওয়া যায়নি। আবার চেষ্টা করতে একটি ভাষা বেছে নিন।"],
    ["Please wait", "অনুগ্রহ করে অপেক্ষা করুন"],
    ["Close full screen", "পূর্ণপর্দা বন্ধ করুন"],
    ["Open chat full screen", "চ্যাট পূর্ণপর্দায় খুলুন"],
    ["Writing a reply…", "উত্তর তৈরি হচ্ছে…"],
    ["No account needed · Answers are based on this portfolio", "অ্যাকাউন্ট লাগবে না · উত্তর পোর্টফোলিওর তথ্যের ভিত্তিতে"],
    ["Ask a question", "আপনার প্রশ্ন লিখুন"],
    ["What’s on your mind?…", "আপনার ভাবনাটা বলুন…"],
    ["Add an image", "ছবি যোগ করুন"],
    ["Record a voice message", "ভয়েস বার্তা রেকর্ড করুন"],
    ["Remove image", "ছবি সরান"],
    ["Selected image preview", "নির্বাচিত ছবির পূর্বরূপ"],
    ["The assistant could not reply right now. Please try again shortly.", "সহকারী এই মুহূর্তে উত্তর দিতে পারছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।"]
  ];

  function isSupported(code) {
    return languageByCode.has(code);
  }

  function makeLanguageButton(language) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = language.label;
    button.lang = language.code;
    button.dataset.languageChoice = language.code;
    button.dataset.noTranslate = "";
    button.addEventListener("click", () => {
      try { localStorage.setItem(choiceKey, language.code); } catch {}
      try { sessionStorage.setItem(choiceKey, language.code); } catch {}
      const url = new URL(window.location.href);
      const isPortfolioHome = ["/", "/index.html", "/bn.html"].includes(url.pathname);
      if (isPortfolioHome) {
        url.pathname = language.code === "bn" ? "/bn.html" : "/";
        url.searchParams.delete("lang");
      } else if (language.code === sourceLanguage) {
        url.searchParams.delete("lang");
      } else {
        url.searchParams.set("lang", language.code);
      }
      window.location.assign(url.toString());
    });
    return button;
  }

  if (dialogOptions) languages.forEach((language) => dialogOptions.append(makeLanguageButton(language)));
  if (menu) languages.forEach((language) => menu.append(makeLanguageButton(language)));
  if (currentLabel) currentLabel.textContent = languageByCode.get(currentLanguage)?.label || "English";
  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.hidden = !menu.hidden;
      menuToggle.setAttribute("aria-expanded", String(!menu.hidden));
    });
    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        menu.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menu.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const hasChoice = document.documentElement.dataset.hasLanguageChoice === "true";
  if (dialog) dialog.hidden = hasChoice;
  if (currentLanguage === sourceLanguage) {
    document.documentElement.classList.remove("language-pending");
    return;
  }

  function collectTargets() {
    const targets = [];
    const segments = [];
    const add = (text, target) => {
      if (typeof text !== "string") return;
      const trimmed = text.trim();
      if (!trimmed || !/[\p{L}\p{N}]/u.test(trimmed)) return;
      const index = segments.push(trimmed) - 1;
      targets.push({ ...target, index, original: text });
    };
    if (document.title) add(document.title, { kind: "title" });
    const description = document.querySelector('meta[name="description"]');
    if (description) add(description.content, { kind: "attribute", node: description, name: "content" });

    const skipSelector = "script,style,noscript,svg,iframe,[data-no-translate]";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest(skipSelector) || parent.closest('[aria-hidden="true"]')) continue;
      add(node.nodeValue, { kind: "text", node });
    }

    const attributeSelector = "[alt],[title],[aria-label],[placeholder],[data-question]";
    document.querySelectorAll(attributeSelector).forEach((element) => {
      if (element.closest(skipSelector)) return;
      ["alt", "title", "aria-label", "placeholder", "data-question"].forEach((name) => {
        if (element.hasAttribute(name)) add(element.getAttribute(name), { kind: "attribute", node: element, name });
      });
    });
    return { targets, segments };
  }

  function setTarget(target, value) {
    if (target.kind === "title") {
      document.title = value;
    } else if (target.kind === "text") {
      target.node.nodeValue = value;
    } else {
      target.node.setAttribute(target.name, value);
    }
  }

  function applyValue(original) {
    if (typeof original !== "string") return original;
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const trimmed = original.trim();
    let translated = sourceToTranslation.get(trimmed);
    if (!translated) {
      for (const [source, target] of sourceToTranslation) {
        if (source.length > 8 && trimmed.startsWith(source)) {
          translated = target + trimmed.slice(source.length);
          break;
        }
      }
    }
    return translated ? leading + translated + trailing : original;
  }

  function installDynamicTranslationObserver() {
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script,style,noscript,svg,iframe,[data-no-translate]")) return;
        const translated = applyValue(node.nodeValue || "");
        if (translated !== node.nodeValue) node.nodeValue = translated;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node;
      if (element.closest("script,style,noscript,svg,iframe,[data-no-translate]")) return;
      ["alt", "title", "aria-label", "placeholder", "data-question"].forEach((name) => {
        if (element.hasAttribute(name)) {
          const value = element.getAttribute(name);
          const translated = applyValue(value);
          if (translated !== value) element.setAttribute(name, translated);
        }
      });
      element.childNodes.forEach(processNode);
    };
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") processNode(record.target);
        if (record.type === "childList") record.addedNodes.forEach(processNode);
        if (record.type === "attributes" && record.target.hasAttribute(record.attributeName)) {
          const value = record.target.getAttribute(record.attributeName);
          const translated = applyValue(value);
          if (translated !== value) record.target.setAttribute(record.attributeName, translated);
        }
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["alt", "title", "aria-label", "placeholder", "data-question"]
    });
  }

  async function initializeTranslation() {
    const captured = collectTargets();
    const dynamicSources = dynamicPairs.flat();
    const segments = captured.segments.concat(dynamicSources);
    if (segments.length > 500 || segments.reduce((sum, value) => sum + value.length, 0) > 24000) {
      throw new Error("The page contains too much text to translate safely.");
    }
    const cacheKey = cachePrefix + sourceLanguage + ":" + currentLanguage;
    const signature = JSON.stringify(segments);
    let translations = null;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.signature === signature && Array.isArray(cached.translations) && cached.translations.length === segments.length) {
        translations = cached.translations;
      }
    } catch {}

    if (!translations) {
      const response = await fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          language: currentLanguage,
          sourceLanguage,
          segments
        }),
        signal: AbortSignal.timeout(35_000)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.translations) || data.translations.length !== segments.length ||
          data.translations.some((value) => typeof value !== "string")) {
        throw new Error("Translation request failed.");
      }
      translations = data.translations;
      try { localStorage.setItem(cacheKey, JSON.stringify({ signature, translations })); } catch {}
    }

    translations.forEach((value, index) => {
      if (index < captured.segments.length) setTarget(captured.targets[index], value);
      sourceToTranslation.set(segments[index], value);
    });
    installDynamicTranslationObserver();
    document.documentElement.classList.remove("language-pending");
  }

  if (!hasChoice && dialog) dialog.hidden = false;
  document.documentElement.classList.add("language-pending");
  initializeTranslation().catch(() => {
    try { localStorage.removeItem(choiceKey); } catch {}
    try { sessionStorage.removeItem(choiceKey); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    window.history.replaceState({}, "", url.toString());
    document.documentElement.dataset.siteLanguage = sourceLanguage;
    document.documentElement.lang = sourceLanguage;
    document.documentElement.dir = sourceLanguage === "ar" || sourceLanguage === "ur" ? "rtl" : "ltr";
    document.documentElement.classList.remove("language-pending");
    if (currentLabel) currentLabel.textContent = languageByCode.get(sourceLanguage)?.label || "English";
    if (dialog) {
      const title = dialog.querySelector("#language-title");
      const message = dialog.querySelector(".language-card>p:not(.language-eyebrow)");
      if (title) title.textContent = sourceLanguage === "bn" ? "অনুবাদ পাওয়া যায়নি" : "Translation unavailable";
      if (message) message.textContent = sourceLanguage === "bn"
        ? "অনুবাদ পাওয়া যায়নি। আবার চেষ্টা করতে একটি ভাষা বেছে নিন।"
        : "Translation unavailable. Please choose a language to try again.";
      dialog.hidden = false;
    }
  });
})();