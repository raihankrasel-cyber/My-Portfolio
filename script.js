// Add Raihan's contact details here to activate the contact buttons.
const CONTACT_EMAIL = "raihan.k.rasel@gmail.com";
const WHATSAPP_NUMBER = "880171299833453"; // International format, digits only, e.g. 8801XXXXXXXXX

document.getElementById("year").textContent = new Date().getFullYear();

const isBangla = document.documentElement.lang === "bn";
const languageDialog = document.getElementById("language-dialog");
if (languageDialog) {
  let languageChoice = null;
  try { languageChoice = localStorage.getItem("portfolio-language-choice"); } catch {}
  if (!languageChoice) languageDialog.hidden = false;
  languageDialog.querySelectorAll("[data-language-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      try { localStorage.setItem("portfolio-language-choice", link.dataset.languageChoice); } catch {}
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

// A lightweight on-site assistant with instant, predefined portfolio answers.
const assistantStyle = document.createElement("style");
assistantStyle.textContent = `
  .portfolio-assistant .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .portfolio-assistant{margin:24px 0 28px;padding:20px;border:1px solid rgba(245,189,54,.28);border-radius:10px;background:linear-gradient(120deg,#121517,#0d0f10);display:grid;grid-template-columns:minmax(180px,.7fr) 1fr;gap:20px;align-items:start}
  .portfolio-assistant-intro h2{font:600 15px var(--display);margin:0 0 7px;color:var(--white)}
  .portfolio-assistant-intro p{font:10px/1.7 var(--font);margin:0;color:var(--muted)}
  .portfolio-assistant-toggle{margin-top:14px;border:1px solid rgba(245,189,54,.6);border-radius:24px;padding:9px 13px;background:transparent;color:var(--white);font:600 10px var(--font);cursor:pointer}
  .portfolio-assistant-toggle:hover{background:#f5bd3618}
  .portfolio-assistant-panel[hidden]{display:none}
  .portfolio-assistant-panel{min-width:0}
  .assistant-messages{height:170px;overflow:auto;padding:12px;border:1px solid var(--line);border-radius:7px;background:#090b0d;display:flex;flex-direction:column;gap:9px}
  .assistant-message{max-width:90%;padding:9px 11px;border-radius:8px;font:10px/1.6 var(--font);white-space:pre-wrap}
  .assistant-message-bot{align-self:flex-start;background:#171a1c;color:#e7e7e1}
  .assistant-message-user{align-self:flex-end;background:#f5bd36;color:#111}
  .assistant-quick-questions{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}
  .assistant-quick-questions button{border:1px solid var(--line);border-radius:20px;background:transparent;color:#ddd;font:9px var(--font);padding:7px 10px;cursor:pointer}
  .assistant-quick-questions button:hover{border-color:#f5bd3680;color:var(--gold)}
  .assistant-form{display:flex;gap:7px}
  .assistant-form input{flex:1;min-width:0;background:#111416;border:1px solid var(--line);border-radius:5px;padding:10px;color:var(--white);font:10px var(--font)}
  .assistant-form input:focus{outline:1px solid #f5bd3680}
  .assistant-form button{border:0;border-radius:5px;background:var(--gold);padding:0 13px;color:#111;font:700 10px var(--font);cursor:pointer}
  .assistant-contact-link{color:var(--gold);text-decoration:underline}
  .assistant-notice{margin:0 0 8px;color:#858a87;font:9px/1.5 var(--font)}
  @media(max-width:640px){.portfolio-assistant{grid-template-columns:1fr;gap:14px;padding:16px}.assistant-messages{height:150px}}
`;
document.head.append(assistantStyle);

const footer = document.querySelector(".footer");
const footerBottom = footer?.querySelector(".footer-bottom");
if (footer && footerBottom) {
  const assistant = document.createElement("section");
  assistant.className = "portfolio-assistant";
  assistant.setAttribute("aria-label", "Portfolio visitor assistant");
  assistant.innerHTML = `
    <div class="portfolio-assistant-intro">
      <h2>Need a quick answer?</h2>
      <p>Ask my portfolio assistant about services, selected work, or how to get in touch.</p>
      <button class="portfolio-assistant-toggle" type="button" aria-expanded="false">Ask the assistant <span aria-hidden="true">↗</span></button>
    </div>
    <div class="portfolio-assistant-panel" hidden>
      <div class="assistant-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="assistant-quick-questions">
        <button type="button" data-question="What services do you offer?">Services</button>
        <button type="button" data-question="Can I see your work?">Selected work</button>
        <button type="button" data-question="How can I contact you?">Contact</button>
      </div>
      <p class="assistant-notice">Messages are sent to OpenAI to generate replies. Raihan also gets a Telegram alert when a chat starts.</p>
      <form class="assistant-form">
        <label class="sr-only" for="assistant-question">Ask a question</label>
        <input id="assistant-question" name="question" maxlength="300" placeholder="Ask a quick question…" autocomplete="off" required>
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  footer.insertBefore(assistant, footerBottom);

  if (isBangla) {
    assistant.querySelector(".portfolio-assistant-intro h2").textContent = "দ্রুত কোনো উত্তর জানতে চান?";
    assistant.querySelector(".portfolio-assistant-intro p").textContent = "সেবা, নির্বাচিত কাজ অথবা যোগাযোগের উপায় সম্পর্কে আমার পোর্টফোলিও সহকারীকে জিজ্ঞেস করুন।";
    assistant.querySelector(".portfolio-assistant-toggle").textContent = "সহকারীকে জিজ্ঞেস করুন ↗";
    const quickLabels = ["সেবাসমূহ", "নির্বাচিত কাজ", "যোগাযোগ"];
    assistant.querySelectorAll("[data-question]").forEach((button, index) => { button.textContent = quickLabels[index]; });
    assistant.querySelector(".assistant-notice").textContent = "আপনার প্রশ্নের উত্তর পোর্টফোলিও-সংক্রান্ত তথ্যের ভিত্তিতে দেওয়া হয়।";
    assistant.querySelector('label[for="assistant-question"]').textContent = "আপনার প্রশ্ন লিখুন";
    assistant.querySelector("#assistant-question").placeholder = "একটি প্রশ্ন করুন…";
    assistant.querySelector(".assistant-form button").textContent = "পাঠান";
  }

  const toggle = assistant.querySelector(".portfolio-assistant-toggle");
  const panel = assistant.querySelector(".portfolio-assistant-panel");
  const messages = assistant.querySelector(".assistant-messages");
  const questionInput = assistant.querySelector("#assistant-question");

  const addAssistantMessage = (text, sender = "bot") => {
    const message = document.createElement("div");
    message.className = `assistant-message assistant-message-${sender}`;
    message.textContent = text;
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const conversation = [];
  const sendQuestion = async (question) => {
    const cleanQuestion = question.trim().slice(0, 300);
    if (!cleanQuestion) return;
    addAssistantMessage(cleanQuestion, "user");
    conversation.push({ role: "user", content: cleanQuestion });
    questionInput.value = "";
    const sendButton = assistant.querySelector(".assistant-form button");
    sendButton.disabled = true;
    sendButton.textContent = "…";
    try {
      const response = await fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.slice(-8), language: isBangla ? "bn" : "en" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The assistant is temporarily unavailable.");
      const reply = typeof data.reply === "string" ? data.reply : "";
      if (!reply) throw new Error("The assistant couldn't create a reply. Please try again.");
      conversation.push({ role: "assistant", content: reply });
      addAssistantMessage(reply);
    } catch (error) {
      if (conversation.at(-1)?.role === "user") conversation.pop();
      addAssistantMessage(error.message || "I couldn't connect just now. Please try again.");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = isBangla ? "পাঠান" : "Send";
      questionInput.focus();
    }
  };

  toggle.addEventListener("click", () => {
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    toggle.setAttribute("aria-expanded", String(isOpening));
    toggle.firstChild.textContent = isBangla ? (isOpening ? "সহকারী বন্ধ করুন " : "সহকারীকে জিজ্ঞেস করুন ") : (isOpening ? "Close assistant " : "Ask the assistant ");
    if (isOpening && !messages.children.length) {
      addAssistantMessage(isBangla ? "হ্যালো! রায়হানের সেবা, নির্বাচিত কাজ অথবা যোগাযোগের উপায় সম্পর্কে জিজ্ঞেস করুন।" : "Hi! Ask me about Raihan's services, selected work, or how to get in touch.");
    }
    if (isOpening) {
      questionInput.focus();
      const alertKey = "portfolio-assistant-chat-start-alert";
      let alreadyAlerted = false;
      try {
        alreadyAlerted = sessionStorage.getItem(alertKey) === "1";
      } catch {}
      if (!alreadyAlerted) {
        fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/chat-start-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "chat_start" })
        }).then((response) => {
          if (response.ok) {
            try {
              sessionStorage.setItem(alertKey, "1");
            } catch {}
          }
        }).catch(() => {});
      }
    }
  });

  assistant.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;
      void sendQuestion(question);
    });
  });

  assistant.querySelector(".assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) return;
    void sendQuestion(question);
    questionInput.value = "";
    questionInput.focus();
  });
}


// Selected work slideshow: advance every three seconds and pause for interaction.
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
