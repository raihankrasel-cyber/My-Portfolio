// Add Raihan's contact details here to activate the contact buttons.
const CONTACT_EMAIL = "raihan.k.rasel@gmail.com";
const WHATSAPP_NUMBER = "880171299833453"; // International format, digits only, e.g. 8801XXXXXXXXX

document.getElementById("year").textContent = new Date().getFullYear();

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
      <p class="assistant-notice">Opening this chat sends Raihan a WhatsApp alert. Your questions stay in this browser.</p>
      <form class="assistant-form">
        <label class="sr-only" for="assistant-question">Ask a question</label>
        <input id="assistant-question" name="question" maxlength="300" placeholder="Ask a quick question…" autocomplete="off" required>
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  footer.insertBefore(assistant, footerBottom);

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

  const answerQuestion = (question) => {
    const text = question.toLowerCase();
    if (/service|seo|search|social|content|strategy|google ads|advertis|marketing/.test(text)) {
      return "Raihan offers Search & SEO, social media, Google Ads, and content & strategy. Use the contact section to discuss what your business needs.";
    }
    if (/work|portfolio|project|creative|example|gallery|case stud/.test(text)) {
      return "You can browse the Selected Creative gallery above for brand direction, campaign artwork, and portfolio visuals.";
    }
    if (/contact|email|whatsapp|phone|message|hire|meet|call/.test(text)) {
      return `You can reach Raihan at ${CONTACT_EMAIL.trim()} or use the WhatsApp link in the contact section.`;
    }
    if (/where|location|based|bangladesh/.test(text)) {
      return "Raihan is a digital marketer based in Bangladesh.";
    }
    if (/price|cost|rate|budget|fee/.test(text)) {
      return "Pricing depends on the project. Share a few details through the contact form and Raihan can discuss the scope with you.";
    }
    if (/hello|hi|hey|assalamu|salam/.test(text)) {
      return "Hi! I can answer quick questions about Raihan's services, selected work, and contact details. What would you like to know?";
    }
    return `I can help with services, selected work, or contact details. For anything specific, email Raihan at ${CONTACT_EMAIL.trim()}.`;
  };

  toggle.addEventListener("click", () => {
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    toggle.setAttribute("aria-expanded", String(isOpening));
    toggle.firstChild.textContent = isOpening ? "Close assistant " : "Ask the assistant ";
    if (isOpening && !messages.children.length) {
      addAssistantMessage("Hi! Ask me about Raihan's services, selected work, or how to get in touch.");
    }
    if (isOpening) {
      questionInput.focus();
      const alertKey = "portfolio-assistant-chat-start-alert";
      let alreadyAlerted = false;
      try {
        alreadyAlerted = sessionStorage.getItem(alertKey) === "1";
      } catch {}
      if (!alreadyAlerted) {
        try {
          sessionStorage.setItem(alertKey, "1");
        } catch {}
        fetch("https://qnmdmsxxcxwzddomwkea.supabase.co/functions/v1/chat-start-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "chat_start" })
        }).catch(() => {});
      }
    }
  });

  assistant.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;
      addAssistantMessage(question, "user");
      addAssistantMessage(answerQuestion(question));
    });
  });

  assistant.querySelector(".assistant-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) return;
    addAssistantMessage(question, "user");
    addAssistantMessage(answerQuestion(question));
    questionInput.value = "";
    questionInput.focus();
  });
}
