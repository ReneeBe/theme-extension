import { useState } from "react";
import type { ThemeVars, GeneratorConfig, GenerateStatus } from "../types/theme";

const DEFAULT_WORKER_URL = "https://nano-claude-theme-manager.reneebe.workers.dev";

const FONT_MAP: Record<string, string> = {
  serif: "'Lora', Georgia, serif",
  "sans-serif": "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  monospace: "'Courier New', Courier, monospace",
  cursive: "'Pacifico', cursive",
  fantasy: "'Orbitron', fantasy",
};

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=Orbitron:wght@400;700;900&family=Lora:wght@400;700&family=Pacifico&display=swap";

function loadGoogleFonts() {
  if (document.getElementById("theme-generator-fonts")) return;
  const link = document.createElement("link");
  link.id = "theme-generator-fonts";
  link.rel = "stylesheet";
  link.href = GOOGLE_FONTS_URL;
  document.head.appendChild(link);
}

function resolveFont(val: string): string {
  return FONT_MAP[val.trim().toLowerCase()] ?? val;
}

type GenerateOptions = Partial<GeneratorConfig> & {
  backgroundStyle?: string;
  magicLinkToken?: string;
};

export function useThemeGenerator() {
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [theme, setTheme] = useState<ThemeVars | null>(null);
  const [paletteImage, setPaletteImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string>("");
  const [patternError, setPatternError] = useState<string | null>(null);

  async function generate(description: string, options: GenerateOptions = {}) {
    if (!description.trim()) return;

    loadGoogleFonts();
    setStatus("loading");
    setError("");
    setPatternError(null);

    try {
      let data: Record<string, unknown>;

      if (options.magicLinkToken) {
        const res = await fetch("https://magiclink.reneebe.workers.dev/api/projects/theme-generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: options.magicLinkToken,
            description,
            ...(options.backgroundStyle && { backgroundStyle: options.backgroundStyle }),
          }),
        });
        const json = await res.json() as Record<string, unknown>;
        if (!res.ok) throw new Error((json.error as string) || "Generation failed");
        data = json.result as Record<string, unknown>;
      } else {
        const workerUrl = options.workerUrl?.trim() || DEFAULT_WORKER_URL;
        const res = await fetch(workerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            ...(options.geminiApiKey && { geminiApiKey: options.geminiApiKey }),
            ...(options.anthropicApiKey && { anthropicApiKey: options.anthropicApiKey }),
            ...(options.backgroundStyle && { backgroundStyle: options.backgroundStyle }),
          }),
        });
        if (!res.ok) {
          const err = await res.json() as Record<string, unknown>;
          throw new Error((err.error as string) || "Generation failed");
        }
        data = await res.json() as Record<string, unknown>;
      }

      const vars: ThemeVars = (data.vars ?? data) as ThemeVars;
      vars["--font-heading"] = resolveFont(vars["--font-heading"]);
      vars["--font-body"] = resolveFont(vars["--font-body"]);

      setTheme(vars);
      if (data.paletteImage) setPaletteImage(data.paletteImage);
      if (data.patternError) setPatternError(data.patternError);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setTheme(null);
    setPaletteImage(null);
    setError("");
    setPatternError(null);
  }

  return { status, theme, paletteImage, error, patternError, generate, reset };
}
