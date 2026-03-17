import { useState, useEffect } from "react";
import { useThemeGenerator } from "../hooks/useThemeGenerator";
import ApiKeyInputs from "../components/ApiKeyInputs";
import ThemePreview from "../components/ThemePreview";

const EXAMPLES = ["ocean at dusk", "retro 80s arcade", "neon tokyo rainstorm", "lisa frank maximalist"];
const PATTERN_EXAMPLES = ["leopard print", "polka dots", "diagonal stripes"];

export default function Popup() {
  const [description, setDescription] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [workerUrl, setWorkerUrl] = useState("");
  const [keysExpanded, setKeysExpanded] = useState(false);

  // Load persisted keys on mount
  useEffect(() => {
    chrome.storage.local.get(["geminiApiKey", "anthropicApiKey", "workerUrl"], (result) => {
      if (result.geminiApiKey) setGeminiApiKey(result.geminiApiKey);
      if (result.anthropicApiKey) setAnthropicApiKey(result.anthropicApiKey);
      if (result.workerUrl) setWorkerUrl(result.workerUrl);
    });
  }, []);

  function handleKeyChange(field: "geminiApiKey" | "anthropicApiKey" | "workerUrl", value: string) {
    if (field === "geminiApiKey") setGeminiApiKey(value);
    else if (field === "anthropicApiKey") setAnthropicApiKey(value);
    else setWorkerUrl(value);
    chrome.storage.local.set({ [field]: value });
  }
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const { status, theme, paletteImage, error, generate, reset } = useThemeGenerator();

  function handleGenerate() {
    reset();
    setApplied(false);
    generate(description, { geminiApiKey, anthropicApiKey, workerUrl, backgroundStyle });
  }

  async function handleApply() {
    if (!theme) return;
    setApplying(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (vars: Record<string, string>) => {
            const css = `:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;
            let style = document.getElementById("theme-extension-styles") as HTMLStyleElement | null;
            if (!style) {
              style = document.createElement("style");
              style.id = "theme-extension-styles";
              document.head.appendChild(style);
            }
            style.textContent = css;
          },
          args: [theme as Record<string, string>],
        });
        setApplied(true);
      }
    } catch (e) {
      console.error("Failed to apply theme:", e);
    } finally {
      setApplying(false);
    }
  }

  function handleCopy() {
    if (!theme) return;
    navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex w-[380px] flex-col gap-3 overflow-y-auto p-4 text-white"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)", maxHeight: "600px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-white/90">Theme Generator</h1>
          <p className="text-[10px] text-white/30">Inject an AI theme into any page</p>
        </div>
        <span className="text-lg">✨</span>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-2.5">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Describe your theme
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            placeholder={`"neon tokyo rainstorm"\n"ocean at dusk"...`}
            rows={2}
            className="w-full resize-none rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setDescription(ex)}
                className="rounded-full border border-white/8 px-2 py-0.5 text-[9px] text-white/30 transition-colors hover:border-white/15 hover:text-white/50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Background pattern <span className="normal-case text-white/20">(optional)</span>
          </label>
          <input
            type="text"
            value={backgroundStyle}
            onChange={(e) => setBackgroundStyle(e.target.value)}
            placeholder="leopard print, polka dots..."
            className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {PATTERN_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setBackgroundStyle(ex)}
                className="rounded-full border border-white/8 px-2 py-0.5 text-[9px] text-white/30 transition-colors hover:border-white/15 hover:text-white/50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <ApiKeyInputs
          geminiApiKey={geminiApiKey}
          anthropicApiKey={anthropicApiKey}
          workerUrl={workerUrl}
          onChange={handleKeyChange}
          expanded={keysExpanded}
          onToggle={() => setKeysExpanded((v) => !v)}
        />

        <button
          onClick={handleGenerate}
          disabled={!description.trim() || status === "loading"}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #f72585, #7209b7)" }}
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating…
            </span>
          ) : (
            "✨ Generate Theme"
          )}
        </button>
      </div>

      {/* Error */}
      {status === "error" && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {/* Result */}
      {status === "success" && theme && (
        <div className="flex flex-col gap-2">
          <ThemePreview theme={theme} paletteImage={paletteImage} onCopy={handleCopy} copied={copied} />
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
            style={{
              background: applied
                ? "linear-gradient(135deg, #06d6a0, #118ab2)"
                : "linear-gradient(135deg, #f72585, #7209b7)",
            }}
          >
            {applying ? "Applying…" : applied ? "✓ Applied to Tab" : "Apply to Current Tab"}
          </button>
        </div>
      )}
    </div>
  );
}
