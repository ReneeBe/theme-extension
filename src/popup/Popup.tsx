import { useState, useEffect } from "react";
import { useThemeGenerator } from "../hooks/useThemeGenerator";
import ApiKeyInputs from "../components/ApiKeyInputs";
import ThemePreview from "../components/ThemePreview";
import SavedThemes from "../components/SavedThemes";
import type { SavedTheme } from "../types/theme";
import { buildThemeCss } from "../utils/buildThemeCss";

const EXAMPLES = ["ocean at dusk", "retro 80s arcade", "neon tokyo rainstorm", "lisa frank maximalist"];
const PATTERN_EXAMPLES = ["leopard print", "polka dots", "diagonal stripes"];

export default function Popup() {
  const [description, setDescription] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [workerUrl, setWorkerUrl] = useState("");
  const [keysExpanded, setKeysExpanded] = useState(false);
  const [savedExpanded, setSavedExpanded] = useState(false);
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);

  // Saved themes state
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [siteThemes, setSiteThemes] = useState<Record<string, string>>({});
  const [currentHostname, setCurrentHostname] = useState<string | null>(null);

  // Save theme UI
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    chrome.storage.local.get(
      ["geminiApiKey", "anthropicApiKey", "workerUrl", "savedThemes", "siteThemes", "magiclink_token"],
      (result) => {
        if (result.geminiApiKey) setGeminiApiKey(result.geminiApiKey);
        if (result.anthropicApiKey) setAnthropicApiKey(result.anthropicApiKey);
        if (result.workerUrl) setWorkerUrl(result.workerUrl);
        if (result.savedThemes) setSavedThemes(result.savedThemes);
        if (result.siteThemes) setSiteThemes(result.siteThemes);
        if (result.magiclink_token) setMagicLinkToken(result.magiclink_token);
      }
    );

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.url) {
        try {
          setCurrentHostname(new URL(tab.url).hostname);
        } catch {}
      }
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

  const { status, theme, paletteImage, error, patternError, generate, reset } = useThemeGenerator();

  function handleGenerate() {
    reset();
    setApplied(false);
    setShowSaveInput(false);
    setSaveName("");
    generate(description, { geminiApiKey, anthropicApiKey, workerUrl, backgroundStyle, ...(magicLinkToken && { magicLinkToken }) });
  }

  async function handleApply() {
    if (!theme) return;
    setApplying(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const css = buildThemeCss(theme as Record<string, string>);
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (cssText: string) => {
            let style = document.getElementById("theme-extension-styles") as HTMLStyleElement | null;
            if (!style) {
              style = document.createElement("style");
              style.id = "theme-extension-styles";
              document.head.appendChild(style);
            }
            style.textContent = cssText;
          },
          args: [css],
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

  function handleSaveTheme() {
    if (!theme || !saveName.trim()) return;
    const newTheme: SavedTheme = {
      id: Date.now().toString(),
      name: saveName.trim(),
      vars: theme,
    };
    const updated = [...savedThemes, newTheme];
    setSavedThemes(updated);
    chrome.storage.local.set({ savedThemes: updated });
    setShowSaveInput(false);
    setSaveName("");
    setSavedExpanded(true);
  }

  function handleApplySaved(saved: SavedTheme) {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      if (!tab?.id) return;
      const css = buildThemeCss(saved.vars as Record<string, string>);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (cssText: string) => {
          let style = document.getElementById("theme-extension-styles") as HTMLStyleElement | null;
          if (!style) {
            style = document.createElement("style");
            style.id = "theme-extension-styles";
            document.head.appendChild(style);
          }
          style.textContent = cssText;
        },
        args: [css],
      });
    });
  }

  function handleDeleteSaved(id: string) {
    const updated = savedThemes.filter((t) => t.id !== id);
    setSavedThemes(updated);
    chrome.storage.local.set({ savedThemes: updated });

    // Also remove site associations pointing to this theme
    const updatedSites = Object.fromEntries(
      Object.entries(siteThemes).filter(([, tid]) => tid !== id)
    );
    setSiteThemes(updatedSites);
    chrome.storage.local.set({ siteThemes: updatedSites });
  }

  function handleToggleSite(id: string) {
    if (!currentHostname) return;
    const updatedSites = { ...siteThemes };
    if (updatedSites[currentHostname] === id) {
      delete updatedSites[currentHostname];
    } else {
      updatedSites[currentHostname] = id;
    }
    setSiteThemes(updatedSites);
    chrome.storage.local.set({ siteThemes: updatedSites });
  }

  const siteThemeId = currentHostname ? (siteThemes[currentHostname] ?? null) : null;

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
          hasMagicLink={!!magicLinkToken}
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
          <ThemePreview theme={theme} description={description} paletteImage={paletteImage} onCopy={handleCopy} copied={copied} />

          {patternError && (
            <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
              Pattern generation failed: {patternError}
            </p>
          )}

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

          {/* Save theme */}
          {!showSaveInput ? (
            <button
              onClick={() => setShowSaveInput(true)}
              className="w-full rounded-xl border border-white/8 py-2 text-xs text-white/40 transition-colors hover:border-white/15 hover:text-white/60"
            >
              Save Theme…
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTheme();
                  if (e.key === "Escape") setShowSaveInput(false);
                }}
                placeholder="Name this theme…"
                className="min-w-0 flex-1 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white/80 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
              />
              <button
                onClick={handleSaveTheme}
                disabled={!saveName.trim()}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #f72585, #7209b7)" }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Themes */}
      <div className="rounded-2xl border border-white/8 bg-white/3">
        <button
          onClick={() => setSavedExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30 transition-colors hover:text-white/50"
        >
          <span>Saved Themes {savedThemes.length > 0 && `(${savedThemes.length})`}</span>
          <span className="text-base leading-none">{savedExpanded ? "−" : "+"}</span>
        </button>

        {savedExpanded && (
          <div className="border-t border-white/5 px-3 pb-3 pt-2">
            {currentHostname && (
              <p className="mb-2 text-[10px] text-white/25">
                Current site: <span className="text-white/40">{currentHostname}</span>
              </p>
            )}
            <SavedThemes
              themes={savedThemes}
              siteThemeId={siteThemeId}
              currentHostname={currentHostname}
              onApply={handleApplySaved}
              onDelete={handleDeleteSaved}
              onToggleSite={handleToggleSite}
            />
          </div>
        )}
      </div>
    </div>
  );
}
