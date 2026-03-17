import type { ThemeVars } from "../types/theme";

type Props = {
  theme: ThemeVars;
  paletteImage?: { base64: string; mimeType: string } | null;
  onCopy: () => void;
  copied: boolean;
};

const SWATCH_KEYS = ["--grad-a", "--grad-b", "--grad-c", "--grad-d"] as const;

export default function ThemePreview({ theme, paletteImage, onCopy, copied }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white/80">Theme generated</p>
          <div className="mt-1.5 flex gap-1">
            {SWATCH_KEYS.map((k) => (
              <div key={k} className="h-3 w-3 rounded-full" style={{ background: theme[k] }} />
            ))}
          </div>
        </div>
        <button
          onClick={onCopy}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition-all hover:border-white/20 hover:text-white/80"
        >
          {copied ? "Copied ✓" : "Copy JSON"}
        </button>
      </div>

      {paletteImage && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            Gemini Palette
          </p>
          <img
            src={`data:${paletteImage.mimeType};base64,${paletteImage.base64}`}
            alt="AI-generated color palette"
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      )}

      {theme["--bg-pattern"] !== "none" && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            Background Pattern
          </p>
          <div
            className="h-16 w-full rounded-xl border border-white/10"
            style={{ backgroundImage: theme["--bg-pattern"], backgroundSize: "auto 100%" }}
          />
        </div>
      )}
    </div>
  );
}
