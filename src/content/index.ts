chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "APPLY_THEME") return;

  const vars = message.vars as Record<string, string>;
  const css = `:root {\n${Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")}\n}`;

  let style = document.getElementById("theme-extension-styles") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "theme-extension-styles";
    document.head.appendChild(style);
  }
  style.textContent = css;
  sendResponse({ ok: true });
});
