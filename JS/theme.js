let activeTheme = "light";

export function initTheme(button) {

  const cachedTheme = localStorage.getItem("theme");

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  activeTheme = cachedTheme || (prefersDark ? "dark" : "light");

  document.body.classList.toggle("dark", activeTheme === "dark");

  if (button) {
    button.textContent = activeTheme === "dark" ? "🌙" : "☀️";
  }
}

export function toggleTheme(button) {

  activeTheme = activeTheme === "light" ? "dark" : "light";

  document.body.classList.toggle("dark", activeTheme === "dark");

  localStorage.setItem("theme", activeTheme);

  if (button) {
    button.textContent = activeTheme === "dark" ? "🌙" : "☀️";
  }
}