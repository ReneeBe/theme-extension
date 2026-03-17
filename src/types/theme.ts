export type ThemeVars = {
  "--background": string;
  "--foreground": string;
  "--blob-1": string;
  "--blob-2": string;
  "--blob-3": string;
  "--blob-4": string;
  "--blob-opacity": string;
  "--blob-blur": string;
  "--grad-a": string;
  "--grad-b": string;
  "--grad-c": string;
  "--grad-d": string;
  "--glass-bg": string;
  "--glass-border": string;
  "--glass-strong-bg": string;
  "--glass-strong-border": string;
  "--blur-glass": string;
  "--blur-glass-strong": string;
  "--font-heading": string;
  "--font-body": string;
  "--bg-pattern": string;
};

export type GeneratorConfig = {
  geminiApiKey: string;
  anthropicApiKey: string;
  workerUrl: string;
};

export type GenerateStatus = "idle" | "loading" | "success" | "error";
