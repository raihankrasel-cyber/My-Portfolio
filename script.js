// Add Raihan's contact details here to activate the contact buttons.
const CONTACT_EMAIL = "raihan.k.rasel@gmail.com";
const WHATSAPP_NUMBER = "880171299833453"; // International format, digits only, e.g. 8801XXXXXXXXX

document.getElementById("year").textContent = new Date().getFullYear();

const isBangla = document.documentElement.lang === "bn";
const languageDialog = document.getElementById("language-dialog");
if (languageDialog) {
  let languageChoice = null;
  try { languageChoice = sessionStorage.getItem("portfolio-language-choice"); } catch {}
  if (!languageChoice) languageDialog.hidden = false;
  languageDialog.querySelectorAll("[data-language-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      try { sessionStorage.setItem("portfolio-language-choice", link.dataset.languageChoice); } catch {}
    });
  });
}

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
      "<div class='assistant-chat-header'><span class='assistant-avatar' aria-hidden='true'>R</span><span class='assistant-chat-identity'><strong class='assistant-chat-title'>Raihan’s portfolio assistant</strong><small class='assistant-chat-subtitle'>Here to think it through with you</small></span><span class='assistant-chat-status'><i></i><span class='assistant-ready-label'>READY</span></span></div>",
      "<div class='assistant-messages' role='log' aria-live='polite' aria-relevant='additions text' aria-busy='false'></div>",
      "<div class='assistant-typing' role='status' aria-live='polite' hidden><span class='assistant-typing-dots' aria-hidden='true'><i></i><i></i><i></i></span><span class='assistant-typing-label'>Writing a reply…</span></div>",
      "<div class='assistant-quick-questions' aria-label='Suggested questions'><button type='button' data-question='What services do you offer?'>Services & skills</button><button type='button' data-question='Can I see your work?'>Selected work</button><button type='button' data-question='How can I contact you?'>Contact</button></div>",
      "<form class='assistant-form'><label class='sr-only' for='assistant-question'>Ask a question</label><input id='assistant-question' name='question' maxlength='300' placeholder='What’s on your mind?…' autocomplete='off' required><button class='assistant-submit' type='submit' aria-label='Send message'><span class='assistant-submit-label'>Send</span><span aria-hidden='true'>↗</span></button></form>",
      "<p class='assistant-notice'>Questions may be sent to OpenAI to generate replies. Raihan is notified after your first message. Please don’t share sensitive information.</p>",
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
    const quickLabels = ["সেবা ও দক্ষতা", "নির্বাচিত কাজ", "যোগাযোগ"];
    quickQuestionLabels.forEach((button, index) => { button.textContent = quickLabels[index]; });
    assistant.querySelector('label[for="assistant-question"]').textContent = "আপনার প্রশ্ন লিখুন";
    assistant.querySelector("#assistant-question").placeholder = "আপনার ভাবনাটা বলুন…";
    assistant.querySelector(".assistant-submit-label").textContent = "পাঠান";
    assistant.querySelector(".assistant-submit").setAttribute("aria-label", "বার্তা পাঠান");
    assistant.querySelector(".assistant-notice").textContent = "উত্তরের জন্য আপনার প্রশ্ন OpenAI-তে পাঠানো হতে পারে। প্রথম বার্তা পাঠালে Raihan-কে জানানো হবে। সংবেদনশীল তথ্য দেবেন না।";
    assistant.querySelector(".assistant-typing-label").textContent = "উত্তর তৈরি হচ্ছে…";
  }

  const toggle = assistant.querySelector(".portfolio-assistant-toggle");
  const toggleLabel = assistant.querySelector(".assistant-toggle-label");
  const toggleIcon = assistant.querySelector(".assistant-toggle-icon");
  const preview = assistant.querySelector(".assistant-preview");
  const panel = assistant.querySelector(".portfolio-assistant-panel");
  const messages = assistant.querySelector(".assistant-messages");
  const typing = assistant.querySelector(".assistant-typing");
  const questionInput = assistant.querySelector("#assistant-question");
  const sendButton = assistant.querySelector(".assistant-submit");
  const sendLabel = assistant.querySelector(".assistant-submit-label");
  const quickButtons = Array.from(quickQuestionLabels);
  const conversation = [];
  let isSending = false;

  const addAssistantMessage = (text, sender = "bot") => {
    const message = document.createElement("div");
    message.className = "assistant-message assistant-message-" + sender;
    message.textContent = text;
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  };

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
    sendButton.disabled = sending;
    messages.setAttribute("aria-busy", String(sending));
    typing.hidden = !sending;
    quickButtons.forEach((button) => { button.disabled = sending; });
    sendLabel.textContent = sending ? (isBangla ? "অপেক্ষা করুন" : "Replying…") : (isBangla ? "পাঠান" : "Send");
    sendButton.setAttribute("aria-label", sending ? (isBangla ? "উত্তরের অপেক্ষায়" : "Waiting for reply") : (isBangla ? "বার্তা পাঠান" : "Send message"));
  };

  const sendQuestion = async (question) => {
    const cleanQuestion = question.trim().slice(0, 300);
    if (!cleanQuestion || isSending) return;
    addAssistantMessage(cleanQuestion, "user");
    conversation.push({ role: "user", content: cleanQuestion });
    questionInput.value = "";
    notifyChatStarted();
    setSending(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.slice(-8), language: isBangla ? "bn" : "en" }),
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

  const setPanelOpen = (open) => {
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
    if (open) questionInput.focus();
  };

  toggle.addEventListener("click", () => setPanelOpen(panel.hidden));
  assistant.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setPanelOpen(false);
      toggle.focus();
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
