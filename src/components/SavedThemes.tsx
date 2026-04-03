import type { SavedTheme } from "../types/theme";

type Props = {
  themes: SavedTheme[];
  siteThemeId: string | null;
  currentHostname: string | null;
  onApply: (theme: SavedTheme) => void;
  onDelete: (id: string) => void;
  onToggleSite: (id: string) => void;
};

const SWATCH_KEYS = ["--grad-a", "--grad-b", "--grad-c", "--grad-d"] as const;

export default function SavedThemes({
  themes,
  siteThemeId,
  currentHostname,
  onApply,
  onDelete,
  onToggleSite,
}: Props) {
  if (themes.length === 0) {
    return <p className="text-center text-[10px] text-white/20 py-2">No saved themes yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {themes.map((t) => {
        const isAutoApplied = siteThemeId === t.id;
        return (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2"
          >
            {/* Color swatches */}
            <div className="flex shrink-0 gap-0.5">
              {SWATCH_KEYS.map((k) => (
                <span
                  key={k}
                  className="h-4 w-4 rounded-full border border-white/10"
                  style={{ background: t.vars[k] ?? "#555" }}
                />
              ))}
            </div>

            {/* Name */}
            <span className="min-w-0 flex-1 truncate text-xs text-white/70">{t.name}</span>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              {currentHostname && (
                <button
                  onClick={() => onToggleSite(t.id)}
                  title={isAutoApplied ? `Remove auto-apply from ${currentHostname}` : `Auto-apply on ${currentHostname}`}
                  className={`rounded-lg px-1.5 py-1 text-[9px] font-semibold transition-colors ${
                    isAutoApplied
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
                  }`}
                >
                  {isAutoApplied ? "✓ site" : "site"}
                </button>
              )}
              <button
                onClick={() => onApply(t)}
                className="rounded-lg bg-white/5 px-1.5 py-1 text-[9px] text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
              >
                apply
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="rounded-lg bg-white/5 px-1.5 py-1 text-[9px] text-white/30 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
