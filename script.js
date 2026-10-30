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
