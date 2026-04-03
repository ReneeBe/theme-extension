export function buildThemeCss(vars: Record<string, string>): string {
  const bg = vars["--background"] ?? "#0a0a0a";
  const fg = vars["--foreground"] ?? "#ffffff";
  const gradA = vars["--grad-a"] ?? vars["--blob-1"] ?? "#7209b7";
  const gradB = vars["--grad-b"] ?? vars["--blob-2"] ?? "#f72585";
  const glassBg = vars["--glass-bg"] ?? "rgba(255,255,255,0.05)";
  const glassBorder = vars["--glass-border"] ?? "rgba(255,255,255,0.1)";
  const fontHeading = vars["--font-heading"] ?? "sans-serif";
  const fontBody = vars["--font-body"] ?? "sans-serif";
  const bgPattern = vars["--bg-pattern"] ?? "none";

  return `
:root {
${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}
}
*, *::before, *::after {
  color: ${fg} !important;
  background-color: transparent !important;
  border-color: ${glassBorder} !important;
}
html, body {
  background-color: ${bg} !important;
  font-family: ${fontBody} !important;
  ${bgPattern !== "none" ? `background-image: ${bgPattern} !important; background-size: cover !important; background-repeat: no-repeat !important;` : ""}
}
h1, h2, h3, h4, h5, h6 { font-family: ${fontHeading} !important; }
a { color: ${gradA} !important; }
a:hover { color: ${gradB} !important; }
button, [role="button"] {
  background: linear-gradient(135deg, ${gradA}, ${gradB}) !important;
  color: #fff !important;
}
input, textarea, select {
  background-color: ${glassBg} !important;
  border: 1px solid ${glassBorder} !important;
}
img, video, canvas, svg, iframe { background-color: transparent !important; filter: none !important; }
`;
}

export function injectThemeCss(vars: Record<string, string>) {
  const css = buildThemeCss(vars);
  let style = document.getElementById("theme-extension-styles") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "theme-extension-styles";
    document.head.appendChild(style);
  }
  style.textContent = css;
}

export function removeThemeCss() {
  document.getElementById("theme-extension-styles")?.remove();
}
