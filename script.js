// Add Raihan's contact details here to activate the contact buttons.
const CONTACT_EMAIL = "raihan.k.rasel@gmail.com";
const WHATSAPP_NUMBER = "880171299833453"; // International format, digits only, e.g. 8801XXXXXXXXX

document.getElementById("year").textContent = new Date().getFullYear();

const isBangla = document.documentElement.lang === "bn";
const assistantLanguage = document.documentElement.dataset.siteLanguage || document.documentElement.lang || "en";

const emailLink = document.getElementById("email-link");
const emailLabel = document.getElementById("email-label");
const whatsappLink = document.getElementById("whatsapp-link");
const whatsappLabel = document.getElementById("whatsapp-label");
const formNote = document.getElementById("form-note");

if (CONTACT_EMAIL.trim()) {
  emailLink.href = `mailto:${CONTACT_EMAIL.trim()}`;
  emailLabel.textContent = CONTACT_EMAIL.trim();
}

if (WHATSAPP_NUMBER.trim()) {
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER.trim()}`;
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noreferrer";
  whatsappLabel.textContent = "Message me on WhatsApp";
}

const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!CONTACT_EMAIL.trim()) {
    formNote.textContent = "Contact form is ready. Add CONTACT_EMAIL in script.js to receive submissions.";
    formNote.classList.add("form-error");
    return;
  }
  const formData = new FormData(contactForm);
  const name = formData.get("name").toString().trim();
  const sender = formData.get("email").toString().trim();
  const message = formData.get("message").toString().trim();
  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${sender}`);
  window.location.href = `mailto:${CONTACT_EMAIL.trim()}?subject=${subject}&body=${body}`;
  formNote.textContent = "Your email app is opening with your message ready to send.";
  formNote.classList.remove("form-error");
});

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

// Footer portfolio assistant
const footer = document.querySelector(".footer");
const footerBottom = footer?.querySelector(".footer-bottom");
if (footer && footerBottom) {
  const assistant = document.createElement("section");
  assistant.className = "portfolio-assistant";
  assistant.setAttribute("aria-label", "Portfolio visitor assistant");
  assistant.innerHTML = [
    "<div class='portfolio-assistant-intro'>",
      "<div class='assistant-heading-row'><span class='assistant-mark' aria-hidden='true'>✦</span><span class='assistant-kicker'>PORTFOLIO ASSISTANT</span><span class='assistant-online'><i></i><span class='assistant-online-label'>ONLINE</span></span></div>",
      "<h2><span class='assistant-title-first'>Have something on your mind?</span><em class='assistant-title-emphasis'>Let’s think it through together.</em></h2>",
      "<p class='assistant-intro-copy'>Tell me what you’re working toward. I’ll think it through with you and help find a practical next step.</p>",
      "<button class='portfolio-assistant-toggle' type='button' aria-expanded='false' aria-controls='portfolio-assistant-panel'><span class='assistant-toggle-label'>Let’s chat</span><span class='assistant-toggle-icon' aria-hidden='true'>↗</span></button>",
      "<small class='assistant-guidance'>No account needed · Answers are based on this portfolio</small>",
    "</div>",
    "<div class='assistant-preview' aria-hidden='true'>",
      "<span class='assistant-preview-label'>QUICK ANSWERS</span>",
      "<div class='assistant-preview-items'><span><i>01</i> Services & skills</span><span><i>02</i> Selected work</span><span><i>03</i> Contact Raihan</span></div>",
      "<span class='assistant-preview-mark' aria-hidden='true'>↗</span>",
    "</div>",
    "<div class='portfolio-assistant-panel' id='portfolio-assistant-panel' hidden>",
      "<div class='assistant-chat-header'><span class='assistant-avatar' aria-hidden='true'>R</span><span class='assistant-chat-identity'><strong class='assistant-chat-title'>Raihan’s portfolio assistant</strong><small class='assistant-chat-subtitle'>Here to think it through with you</small></span><button class='assistant-expand' type='button' aria-label='Open chat full screen' aria-pressed='false' title='Fullscreen'>⛶</button><span class='assistant-chat-status'><i></i><span class='assistant-ready-label'>READY</span></span></div>",
      "<div class='assistant-messages' role='log' aria-live='polite' aria-relevant='additions text' aria-busy='false'></div>",
      "<div class='assistant-typing' role='status' aria-live='polite' hidden><span class='assistant-typing-dots' aria-hidden='true'><i></i><i></i><i></i></span><span class='assistant-typing-label'>Writing a reply…</span></div>",
      "<div class='assistant-quick-questions' aria-label='Suggested questions'><button type='button' data-question='What services do you offer?'>Services & skills</button><button type='button' data-question='Can I see your work?'>Selected work</button><button type='button' data-question='How can I contact you?'>Contact</button></div>",
            "<section class='assistant-skill-picks' aria-label='Mini marketing skills'>",
        "<span class='assistant-skill-label'>MINI SKILLS · JUST FOR FUN</span>",
        "<div class='assistant-skill-buttons'>",
          "<button type='button' data-question='Give me three playful marketing ideas for a small business this week.'>✨ Idea spark</button>",
          "<button type='button' data-question='Give me one quick SEO improvement I can make to my portfolio today.'>🔎 SEO sidekick</button>",
          "<button type='button' data-question='Help me investigate why a marketing metric might be going up or down.'>📊 Metric detective</button>",
          "<button type='button' data-question='Write a friendly, catchy social media caption for a small business.'>✍️ Caption chef</button>",
          "<button type='button' data-question='Suggest a likely target audience for a digital marketing campaign for a small business.'>🎯 Audience finder</button>",
          "<button type='button' data-question='Give me two headline or ad variations I could A/B test, and what to compare.'>🧪 A/B idea lab</button>",
          "<button type='button' data-question='Polish a sentence to make it clearer and punchier. Ask me to paste the sentence.'>🧹 Copy polisher</button>",
          "<button type='button' data-question='Suggest a simple seven-day social content plan for a small business.'>🗓️ Content planner</button>",
          "<button type='button' data-question='Give me a checklist for reviewing competitors’ marketing without making unsupported claims.'>🕵️ Competitor scout</button>",
        "</div>",
      "</section>",
      "<div class='assistant-media-tools'><button class='assistant-tool assistant-attach' type='button' aria-label='Add an image'>＋ Image</button><input class='sr-only assistant-image-input' type='file' accept='image/jpeg,image/png,image/webp'><button class='assistant-tool assistant-mic' type='button' aria-label='Record a voice message'>🎙 Voice</button><span class='assistant-voice-status' role='status' aria-live='polite'></span></div><div class='assistant-image-preview' hidden><img alt='Selected image preview'><button class='assistant-image-remove' type='button' aria-label='Remove image'>×</button></div><form class='assistant-form'><label class='sr-only' for='assistant-question'>Ask a question</label><input id='assistant-question' name='question' maxlength='300' placeholder='What’s on your mind?…' autocomplete='off'><button class='assistant-submit' type='submit' aria-label='Send message'><span class='assistant-submit-label'>Send</span><span aria-hidden='true'>↗</span></button></form>",
      "<p class='assistant-notice'>Your text messages are saved privately so Raihan can review chat history. Images and recordings are not saved. Text, images, and recordings may be sent to OpenAI to generate replies. A private alert may be sent to Raihan when you start chatting. Please don’t share sensitive information.</p>",
    "</div>",
  ].join("");
  footer.insertBefore(assistant, footerBottom);

  const quickQuestionLabels = assistant.querySelectorAll("[data-question]");
  if (isBangla) {
    assistant.querySelector(".assistant-kicker").textContent = "পোর্টফোলিও সহকারী";
    assistant.querySelector(".assistant-online-label").textContent = "এখন অনলাইন";
    assistant.querySelector(".assistant-title-first").textContent = "কিছু জানতে বা ভাবতে চান?";
    assistant.querySelector(".assistant-title-emphasis").textContent = "চলুন একসঙ্গে ভেবে দেখি।";
    assistant.querySelector(".assistant-intro-copy").textContent = "আপনি কী নিয়ে ভাবছেন বলুন—একসঙ্গে ভেবে আপনার জন্য কাজে লাগবে এমন পরবর্তী পদক্ষেপ খুঁজে বের করি।";
    assistant.querySelector(".assistant-toggle-label").textContent = "চলুন কথা বলি";
    assistant.querySelector(".assistant-guidance").textContent = "অ্যাকাউন্ট লাগবে না · উত্তর পোর্টফোলিওর তথ্যের ভিত্তিতে";
    const previewLabels = ["সেবা ও দক্ষতা", "নির্বাচিত কাজ", "রায়হানের সঙ্গে যোগাযোগ"];
    assistant.querySelectorAll(".assistant-preview-items span").forEach((item, index) => {
      item.lastChild.textContent = " " + previewLabels[index];
    });
    assistant.querySelector(".assistant-chat-title").textContent = "রায়হানের পোর্টফোলিও সহকারী";
    assistant.querySelector(".assistant-chat-subtitle").textContent = "একসঙ্গে ভেবে দেখতে পাশে আছি";
    assistant.querySelector(".assistant-ready-label").textContent = "প্রস্তুত";
    assistant.querySelector(".assistant-expand").setAttribute("aria-label", "চ্যাট পূর্ণপর্দায় খুলুন");
    assistant.querySelector(".assistant-expand").title = "পূর্ণপর্দা";
    const quickLabels = ["সেবা ও দক্ষতা", "নির্বাচিত কাজ", "যোগাযোগ"];
    quickQuestionLabels.forEach((button, index) => { button.textContent = quickLabels[index]; });
    const miniSkillButtons = assistant.querySelectorAll(".assistant-skill-buttons button");
    const miniSkillLabels = [
      "✨ আইডিয়া স্পার্ক", "🔎 SEO সহকারী", "📊 মেট্রিক গোয়েন্দা",
      "✍️ ক্যাপশন শেফ", "🎯 অডিয়েন্স খোঁজক", "🧪 A/B আইডিয়া ল্যাব",
      "🧹 কপি পালিশার", "🗓️ কনটেন্ট প্ল্যানার", "🕵️ প্রতিদ্বন্দ্বী স্কাউট",
    ];
    const miniSkillPrompts = [
      "এই সপ্তাহে একটি ছোট ব্যবসার প্রচারের জন্য তিনটি মজার আইডিয়া দিন।",
      "আজই আমার পোর্টফোলিওর SEO উন্নত করার একটি দ্রুত উপায় বলুন।",
      "মার্কেটিংয়ের কোনো মেট্রিক কেন বাড়তে বা কমতে পারে তা খুঁজে দেখতে সাহায্য করুন।",
      "একটি ছোট ব্যবসার জন্য বন্ধুত্বপূর্ণ ও আকর্ষণীয় সোশ্যাল মিডিয়া ক্যাপশন লিখুন।",
      "একটি ছোট ব্যবসার ডিজিটাল মার্কেটিং ক্যাম্পেইনের সম্ভাব্য লক্ষ্য-দর্শক কারা হতে পারে বলুন।",
      "A/B টেস্টের জন্য দুটি বিজ্ঞাপন বা শিরোনামের বিকল্প দিন এবং কী তুলনা করব বলুন।",
      "একটি বাক্য পরিষ্কার ও জোরালো করে লিখতে সাহায্য করুন। বাক্যটি দিতে বলুন।",
      "একটি ছোট ব্যবসার জন্য সাত দিনের সোশ্যাল কনটেন্ট পরিকল্পনা দিন।",
      "প্রতিদ্বন্দ্বীদের মার্কেটিং পর্যালোচনার একটি চেকলিস্ট দিন, যেন ভিত্তিহীন দাবি না হয়।",
    ];
    miniSkillButtons.forEach((button, index) => {
      button.textContent = miniSkillLabels[index];
      button.dataset.question = miniSkillPrompts[index];
    });
    assistant.querySelector(".assistant-skill-label").textContent = "মিনি স্কিল · শুধু মজার জন্য";
    assistant.querySelector('label[for="assistant-question"]').textContent = "আপনার প্রশ্ন লিখুন";
    assistant.querySelector("#assistant-question").placeholder = "আপনার ভাবনাটা বলুন…";
    assistant.querySelector(".assistant-attach").textContent = "＋ ছবি";
    assistant.querySelector(".assistant-attach").setAttribute("aria-label", "ছবি যোগ করুন");
    assistant.querySelector(".assistant-mic").textContent = "🎙 ভয়েস";
    assistant.querySelector(".assistant-mic").setAttribute("aria-label", "ভয়েস বার্তা রেকর্ড করুন");
    assistant.querySelector(".assistant-image-remove").setAttribute("aria-label", "ছবি সরান");
    assistant.querySelector(".assistant-submit-label").textContent = "পাঠান";
    assistant.querySelector(".assistant-submit").setAttribute("aria-label", "বার্তা পাঠান");
    assistant.querySelector(".assistant-notice").textContent = "আপনার টেক্সট বার্তা ব্যক্তিগতভাবে সংরক্ষিত হয়, যাতে Raihan চ্যাটের ইতিহাস দেখতে পারেন। ছবি ও রেকর্ডিং সংরক্ষণ করা হয় না। উত্তর তৈরির জন্য বার্তা, ছবি বা রেকর্ডিং OpenAI-তে পাঠানো হতে পারে। চ্যাট শুরু হলে Raihan-কে ব্যক্তিগত নোটিফিকেশন পাঠানো হতে পারে। সংবেদনশীল তথ্য দেবেন না।";
    assistant.querySelector(".assistant-typing-label").textContent = "উত্তর তৈরি হচ্ছে…";
  }

  const toggle = assistant.querySelector(".portfolio-assistant-toggle");
  const toggleLabel = assistant.querySelector(".assistant-toggle-label");
  const toggleIcon = assistant.querySelector(".assistant-toggle-icon");
  const preview = assistant.querySelector(".assistant-preview");
  const panel = assistant.querySelector(".portfolio-assistant-panel");
  const expandButton = assistant.querySelector(".assistant-expand");
  const messages = assistant.querySelector(".assistant-messages");
  const typing = assistant.querySelector(".assistant-typing");
  const questionInput = assistant.querySelector("#assistant-question");
  const imageInput = assistant.querySelector(".assistant-image-input");
  const imagePreview = assistant.querySelector(".assistant-image-preview");
  const previewImage = imagePreview.querySelector("img");
  const voiceStatus = assistant.querySelector(".assistant-voice-status");
  const micButton = assistant.querySelector(".assistant-mic");
  let selectedImage = null;
  let recorder = null;
  let audioChunks = [];
  let recordingTimer = null;
  const voicePauseKey = "portfolio-assistant-voice-paused-until";
  const voiceRetryKey = "portfolio-assistant-voice-retry-seconds";
  const voiceLastCheckKey = "portfolio-assistant-voice-last-check";
  let voiceCheckTimer = null;
  let voiceRetrySeconds = 900;
  const sendButton = assistant.querySelector(".assistant-submit");
  const sendLabel = assistant.querySelector(".assistant-submit-label");
  const quickButtons = Array.from(quickQuestionLabels);
  const conversation = [];
  const conversationId = crypto.randomUUID();
  let isSending = false;

  const addAssistantMessage = (text, sender = "bot", imageData = null) => {
    const message = document.createElement("div");
    message.className = "assistant-message assistant-message-" + sender;
    if (text) { const copy = document.createElement("div"); copy.textContent = text; message.append(copy); }
    if (imageData && sender === "user") {
      const image = document.createElement("img"); image.className = "assistant-message-image";
      image.src = imageData; image.alt = isBangla ? "আপনার পাঠানো ছবি" : "Image you sent"; message.append(image);
    }
    if (sender === "bot" && text && "speechSynthesis" in window) {
      const speak = document.createElement("button"); speak.type = "button"; speak.className = "assistant-speak";
      speak.textContent = isBangla ? "🔊 শুনুন" : "🔊 Listen";
      speak.setAttribute("aria-label", isBangla ? "উত্তরটি পড়ে শোনান" : "Read this reply aloud");
      speak.addEventListener("click", () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text); utterance.lang = ({ en: "en-US", bn: "bn-BD" })[assistantLanguage] || "en-US";
        window.speechSynthesis.speak(utterance);
      });
      message.append(speak);
    }
    messages.append(message); messages.scrollTop = messages.scrollHeight;
  };

  const prepareImage = (file) => new Promise((resolve, reject) => {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      reject(new Error(isBangla ? "JPG, PNG বা WebP ছবি ৮ MB-এর মধ্যে দিন।" : "Choose a JPG, PNG, or WebP image under 8 MB.")); return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(isBangla ? "ছবিটি পড়া যায়নি।" : "Could not read that image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(isBangla ? "ছবিটি খোলা যায়নি।" : "Could not open that image."));
      image.onload = () => {
        const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let compressed = canvas.toDataURL("image/jpeg", 0.74);
        if (compressed.length > 1_400_000) {
          canvas.width = Math.max(1, Math.round(canvas.width * 0.75));
          canvas.height = Math.max(1, Math.round(canvas.height * 0.75));
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          compressed = canvas.toDataURL("image/jpeg", 0.66);
        }
        if (compressed.length > 1_400_000) {
          reject(new Error(isBangla ? "ছবিটি খুব বড়। ছোট ছবি ব্যবহার করুন।" : "That image is still too large. Please choose a smaller image."));
          return;
        }
        resolve(compressed);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const notifyChatStarted = () => {
    const alertKey = "portfolio-assistant-chat-start-alert";
    let alreadyAlerted = false;
    try { alreadyAlerted = sessionStorage.getItem(alertKey) === "1"; } catch {}
    if (alreadyAlerted) return;
    fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/chat-start-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "chat_start" }),
    }).then((response) => {
      if (response.ok) {
        try { sessionStorage.setItem(alertKey, "1"); } catch {}
      }
    }).catch(() => {});
  };

  const setSending = (sending) => {
    isSending = sending;
    questionInput.disabled = sending;
    micButton.disabled = sending;
    sendButton.disabled = sending;
    messages.setAttribute("aria-busy", String(sending));
    typing.hidden = !sending;
    quickButtons.forEach((button) => { button.disabled = sending; });
    sendLabel.textContent = sending ? (isBangla ? "অপেক্ষা করুন" : "Replying…") : (isBangla ? "পাঠান" : "Send");
    sendButton.setAttribute("aria-label", sending ? (isBangla ? "উত্তরের অপেক্ষায়" : "Waiting for reply") : (isBangla ? "বার্তা পাঠান" : "Send message"));
  };

  const voicePausedMessage = () => isBangla
    ? "ভয়েস ইনপুট সাময়িক বন্ধ—সীমা উঠলে নিজে থেকেই ফিরবে।"
    : "Voice input is paused. I’ll check automatically and show it again when it’s available.";

  const scheduleVoiceCheck = (seconds) => {
    const delaySeconds = Math.max(60, Math.min(21600, Math.ceil(Number(seconds) || 900)));
    voiceRetrySeconds = Math.max(voiceRetrySeconds, delaySeconds);
    micButton.hidden = true;
    voiceStatus.textContent = voicePausedMessage();
    window.clearTimeout(voiceCheckTimer);
    const retryAt = Date.now() + delaySeconds * 1000;
    try {
      localStorage.setItem(voicePauseKey, String(retryAt));
      localStorage.setItem(voiceRetryKey, String(voiceRetrySeconds));
    } catch {}
    voiceCheckTimer = window.setTimeout(() => { void checkVoiceAvailability(); }, delaySeconds * 1000);
  };

  const checkVoiceAvailability = async () => {
    voiceStatus.textContent = voicePausedMessage();
    try {
      localStorage.setItem(voiceLastCheckKey, String(Date.now()));
    } catch {}
    try {
      const response = await fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceStatusCheck: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.available === true) {
        window.clearTimeout(voiceCheckTimer);
        micButton.hidden = false;
        voiceRetrySeconds = 900;
        try { localStorage.removeItem(voicePauseKey); localStorage.removeItem(voiceRetryKey); } catch {}
        voiceStatus.textContent = isBangla ? "ভয়েস ইনপুট আবার চালু হয়েছে।" : "Voice input is available again.";
        window.setTimeout(() => {
          if (!micButton.hidden) voiceStatus.textContent = "";
        }, 5000);
        return;
      }
      scheduleVoiceCheck(Math.max(Number(data.retryAfterSeconds) || 0, Math.min(21600, voiceRetrySeconds * 2)));
    } catch {
      scheduleVoiceCheck(Math.min(21600, voiceRetrySeconds * 2));
    }
  };

  try {
    const retryAt = Number(localStorage.getItem(voicePauseKey) || 0);
    voiceRetrySeconds = Number(localStorage.getItem(voiceRetryKey) || 900);
    if (retryAt > 0) {
      micButton.hidden = true;
      if (retryAt > Date.now()) scheduleVoiceCheck((retryAt - Date.now()) / 1000);
      else void checkVoiceAvailability();
    }
  } catch {}

  const sendQuestion = async (question) => {
    const cleanQuestion = question.trim().slice(0, 300);
    if ((!cleanQuestion && !selectedImage) || isSending) return;
    const imageForMessage = selectedImage;
    const fallbackText = isBangla ? "এই ছবিটি সম্পর্কে বলুন।" : "What can you tell me about this image?";
    const messageContent = imageForMessage
      ? [{ type: "input_text", text: cleanQuestion || fallbackText }, { type: "input_image", image_url: imageForMessage }]
      : cleanQuestion;
    addAssistantMessage(cleanQuestion || (imageForMessage ? fallbackText : ""), "user", imageForMessage);
    conversation.push({ role: "user", content: messageContent });
    if (imageForMessage) conversation.slice(0, -1).forEach((turn) => {
      if (turn.role === "user" && Array.isArray(turn.content)) turn.content = turn.content.filter((part) => part.type !== "input_image");
    });
    questionInput.value = "";
    selectedImage = null; imageInput.value = ""; imagePreview.hidden = true;
    notifyChatStarted();
    setSending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.slice(-8), language: assistantLanguage, conversationId }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error("Assistant request failed");
      const reply = typeof data.reply === "string" ? data.reply.trim() : "";
      if (!reply) throw new Error("Assistant returned no reply");
      conversation.push({ role: "assistant", content: reply });
      addAssistantMessage(reply);
    } catch (error) {
      if (conversation.at(-1)?.role === "user") conversation.pop();
      const message = error.name === "AbortError"
        ? (isBangla ? "উত্তর পেতে একটু বেশি সময় লাগছে। আবার চেষ্টা করুন।" : "That took longer than expected. Please try again.")
        : (isBangla ? "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।" : "Sorry, I couldn’t get a reply just now. Please try again shortly.");
      addAssistantMessage(message);
    } finally {
      window.clearTimeout(timeoutId);
      setSending(false);
      questionInput.focus();
    }
  };

  const panelHome = panel.parentElement;
  const setFullscreen = (open) => {
    if (open && panel.parentElement !== document.body) document.body.append(panel);
    if (!open && panel.parentElement === document.body) assistant.append(panel);
    panel.classList.toggle("is-fullscreen", open);
    document.body.classList.toggle("assistant-fullscreen-open", open);
    expandButton.setAttribute("aria-pressed", String(open));
    expandButton.setAttribute("aria-label", isBangla
      ? (open ? "পূর্ণপর্দা বন্ধ করুন" : "চ্যাট পূর্ণপর্দায় খুলুন")
      : (open ? "Exit full screen" : "Open chat full screen"));
    expandButton.title = isBangla ? (open ? "পূর্ণপর্দা বন্ধ" : "পূর্ণপর্দা") : (open ? "Exit full screen" : "Fullscreen");
    expandButton.textContent = open ? "×" : "⛶";
  };
  expandButton.addEventListener("click", () => setFullscreen(!panel.classList.contains("is-fullscreen")));
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-fullscreen")) {
      event.stopPropagation();
      setFullscreen(false);
      expandButton.focus();
    }
  });

  const setPanelOpen = (open) => {
    if (!open && panel.classList.contains("is-fullscreen")) setFullscreen(false);
    panel.hidden = !open;
    preview.hidden = open;
    assistant.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggleLabel.textContent = isBangla ? (open ? "চ্যাট বন্ধ করুন" : "চলুন কথা বলি") : (open ? "Close chat" : "Let’s chat");
    toggleIcon.textContent = open ? "×" : "↗";
    if (open && !messages.children.length) {
      addAssistantMessage(isBangla
        ? "আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ! হাই! কী নিয়ে কাজ করছেন? একটু বলুন—একসঙ্গে ভেবে দেখি কীভাবে এগোনো যায়।"
        : "Hey! What are you working on? Tell me a little, and we’ll figure out a good next step together.");
    }
    if (open) {
      questionInput.focus();
      if (!micButton.hidden) {
        let lastVoiceCheck = 0;
        try { lastVoiceCheck = Number(localStorage.getItem(voiceLastCheckKey) || 0); } catch {}
        if (Date.now() - lastVoiceCheck > 15 * 60 * 1000) void checkVoiceAvailability();
      }
    }
  };

  assistant.querySelector(".assistant-attach").addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0]; if (!file) return;
    try { selectedImage = await prepareImage(file); previewImage.src = selectedImage; imagePreview.hidden = false; voiceStatus.textContent = ""; questionInput.focus(); }
    catch (error) { imageInput.value = ""; voiceStatus.textContent = error.message; }
  });
  assistant.querySelector(".assistant-image-remove").addEventListener("click", () => {
    selectedImage = null; imageInput.value = ""; previewImage.removeAttribute("src"); imagePreview.hidden = true;
  });
  micButton.addEventListener("click", async () => {
    if (isSending) return;
    if (recorder?.state === "recording") { recorder.stop(); window.clearTimeout(recordingTimer); micButton.textContent = isBangla ? "🎙 ভয়েস" : "🎙 Voice"; return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      voiceStatus.textContent = isBangla ? "এই ব্রাউজারে ভয়েস রেকর্ডিং সমর্থিত নয়।" : "Voice recording isn’t supported in this browser."; return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); audioChunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) audioChunks.push(event.data); };
      recorder.onerror = () => { stream.getTracks().forEach((track) => track.stop()); voiceStatus.textContent = isBangla ? "রেকর্ডিং ব্যর্থ হয়েছে।" : "Recording failed."; };
      recorder.onstop = async () => {
        micButton.textContent = isBangla ? "🎙 ভয়েস" : "🎙 Voice";
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunks, { type: recorder.mimeType || "audio/webm" });
        if (!blob.size) return;
        if (blob.size > 10 * 1024 * 1024) { voiceStatus.textContent = isBangla ? "রেকর্ডিংটি ১০ MB-এর বেশি। ছোট করে বলুন।" : "Recording is over 10 MB. Please record a shorter message."; return; }
        voiceStatus.textContent = isBangla ? "কথা লিখে নেওয়া হচ্ছে…" : "Transcribing your voice…"; setSending(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, blob.type.includes("mp4") ? "voice.mp4" : "voice.webm");
          formData.append("language", assistantLanguage);
          const response = await fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/portfolio-assistant", { method: "POST", body: formData });
          const data = await response.json().catch(() => ({}));
          if (response.status === 429) {
            scheduleVoiceCheck(Number(data.retryAfterSeconds) || 900);
            return;
          }
          if (!response.ok || !data.transcript) throw new Error(data.error || "Transcription failed");
          questionInput.value = data.transcript.slice(0, 300);
          voiceStatus.textContent = isBangla ? "কথাটি লিখে দেওয়া হয়েছে—পাঠানোর আগে সম্পাদনা করুন।" : "Transcribed—edit it if you like, then send.";
          questionInput.focus();
        } catch (error) {
          const detail = error instanceof Error ? error.message : "";
          if (isBangla && detail.toLowerCase().includes("usage limit")) {
            voiceStatus.textContent = "AI সেবার সাময়িক ব্যবহারসীমার কারণে ভয়েস লেখা যাচ্ছে না। বার্তাটি টাইপ করুন বা কিছুক্ষণ পর চেষ্টা করুন।";
          } else if (isBangla && detail.toLowerCase().includes("unsupported audio format")) {
            voiceStatus.textContent = "এই অডিও ফরম্যাটটি সমর্থিত নয়। আবার রেকর্ড করে চেষ্টা করুন।";
          } else if (detail && detail !== "Transcription failed") {
            voiceStatus.textContent = isBangla ? "ভয়েস লেখা যায়নি: " + detail : detail;
          } else {
            voiceStatus.textContent = isBangla ? "কথা লিখে নেওয়া যায়নি। আবার চেষ্টা করুন।" : "I couldn’t transcribe that. Please try again.";
          }
        } finally { setSending(false); }
      };
      recorder.start(); micButton.textContent = isBangla ? "■ থামান" : "■ Stop";
      voiceStatus.textContent = isBangla ? "রেকর্ড হচ্ছে… সর্বোচ্চ ১৫ সেকেন্ড" : "Recording… up to 15 seconds";
      recordingTimer = window.setTimeout(() => { if (recorder?.state === "recording") recorder.stop(); }, 15000);
    } catch { voiceStatus.textContent = isBangla ? "মাইক্রোফোন ব্যবহারের অনুমতি দিন।" : "Allow microphone access to record a message."; }
  });
  toggle.addEventListener("click", () => setPanelOpen(panel.hidden));
  assistant.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      if (panel.classList.contains("is-fullscreen")) {
        setFullscreen(false);
        expandButton.focus();
      } else {
        setPanelOpen(false);
        toggle.focus();
      }
    }
  });

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => { void sendQuestion(button.dataset.question); });
  });

  assistant.querySelector(".assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    void sendQuestion(questionInput.value);
  });
}


//// Selected work slideshow: advance every three seconds and pause for interaction.
const workCarousel = document.querySelector(".work-grid[aria-roledescription='carousel']");
if (workCarousel) {
  const workSlides = Array.from(workCarousel.querySelectorAll(".work-item"));
  const workStatus = document.querySelector(".work-slide-status");
  const previousButton = document.querySelector(".work-previous");
  const nextButton = document.querySelector(".work-next");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeSlide = 0;
  let rotationTimer;
  let isPaused = false;

  const showWorkSlide = (index) => {
    activeSlide = (index + workSlides.length) % workSlides.length;
    workSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-label", `${slideIndex + 1} of ${workSlides.length}`);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
    });
    workStatus.textContent = `${activeSlide + 1} / ${workSlides.length}`;
  };

  const stopRotation = () => window.clearInterval(rotationTimer);
  const startRotation = () => {
    stopRotation();
    if (!isPaused && !reduceMotion.matches && !document.hidden) {
      rotationTimer = window.setInterval(() => showWorkSlide(activeSlide + 1), 3000);
    }
  };

  previousButton.addEventListener("click", () => {
    showWorkSlide(activeSlide - 1);
    startRotation();
  });
  nextButton.addEventListener("click", () => {
    showWorkSlide(activeSlide + 1);
    startRotation();
  });
  workCarousel.addEventListener("mouseenter", () => {
    isPaused = true;
    stopRotation();
  });
  workCarousel.addEventListener("mouseleave", () => {
    isPaused = false;
    startRotation();
  });
  workCarousel.addEventListener("focusin", () => {
    isPaused = true;
    stopRotation();
  });
  workCarousel.addEventListener("focusout", (event) => {
    if (!workCarousel.contains(event.relatedTarget)) {
      isPaused = false;
      startRotation();
    }
  });
  document.addEventListener("visibilitychange", startRotation);
  reduceMotion.addEventListener?.("change", startRotation);

  showWorkSlide(0);
  startRotation();
}
