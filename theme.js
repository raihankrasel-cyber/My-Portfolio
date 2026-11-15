(() => {
  const storageKey = "portfolio-theme";
  const root = document.documentElement;

  try {
    root.dataset.theme = localStorage.getItem(storageKey) === "light" ? "light" : "dark";
  } catch {
    root.dataset.theme = "dark";
  }

  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  button.setAttribute("aria-pressed", String(root.dataset.theme === "light"));
  button.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true"></span><span class="theme-toggle-label"></span>';
  button.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    button.setAttribute("aria-pressed", String(nextTheme === "light"));
    updateLabel();
    try { localStorage.setItem(storageKey, nextTheme); } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "light" ? "#f5f7fb" : "#090b0d");
  });

  function updateLabel() {
    const isLight = root.dataset.theme === "light";
    button.querySelector(".theme-toggle-icon").textContent = isLight ? "☾" : "☼";
    button.querySelector(".theme-toggle-label").textContent = isLight ? "Dark mode" : "Light mode";
    button.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    button.title = isLight ? "Switch to dark mode" : "Switch to light mode";
  }

  updateLabel();
  document.body.append(button);
})();
