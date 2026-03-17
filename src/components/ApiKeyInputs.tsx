type Props = {
  geminiApiKey: string;
  anthropicApiKey: string;
  workerUrl: string;
  onChange: (field: "geminiApiKey" | "anthropicApiKey" | "workerUrl", value: string) => void;
  expanded: boolean;
  onToggle: () => void;
};

export default function ApiKeyInputs({ geminiApiKey, anthropicApiKey, workerUrl, onChange, expanded, onToggle }: Props) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30 transition-colors hover:text-white/50"
      >
        <span>API Keys & Worker</span>
        <span className="text-base leading-none">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-white/5 px-4 pb-4 pt-3">
          <Field
            label="Gemini API Key"
            placeholder="AIza..."
            value={geminiApiKey}
            onChange={(v) => onChange("geminiApiKey", v)}
            type="password"
          />
          <Field
            label="Anthropic API Key"
            placeholder="sk-ant-..."
            value={anthropicApiKey}
            onChange={(v) => onChange("anthropicApiKey", v)}
            type="password"
          />
          <Field
            label="Worker URL"
            placeholder="https://nano-claude-theme-manager.reneebe.workers.dev"
            value={workerUrl}
            onChange={(v) => onChange("workerUrl", v)}
            type="text"
          />
          <p className="text-[10px] leading-relaxed text-white/20">
            Your keys are sent only to the Worker URL above — never stored anywhere.
            Want to use your own worker?{" "}
            <a
              href="https://github.com/ReneeBe/nano-claude-theme-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 underline underline-offset-2 hover:text-white/60"
            >
              Fork the worker on GitHub
            </a>
            , deploy it to Cloudflare, and paste your URL above.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: "text" | "password";
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-white/30">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
      />
    </div>
  );
}
