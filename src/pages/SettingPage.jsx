import { THEMES } from "../constant/index";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen pt-14 bg-base-200/40">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-up">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-base-content/40 mt-0.5">Customise your Zeno experience</p>
        </div>

        {/* Theme picker */}
        <div className="bg-base-100 rounded-2xl border border-base-300/60 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">Theme</h2>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all press
                  ${theme === t ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-base-200/70"}`}
              >
                <div
                  className="h-6 w-full rounded-md overflow-hidden"
                  data-theme={t}
                >
                  <div className="grid grid-cols-4 gap-[2px] p-[3px] h-full">
                    <div className="rounded-sm bg-primary" />
                    <div className="rounded-sm bg-secondary" />
                    <div className="rounded-sm bg-accent" />
                    <div className="rounded-sm bg-neutral" />
                  </div>
                </div>
                <span className={`text-[10px] font-medium truncate w-full text-center
                  ${theme === t ? "text-primary" : "text-base-content/50"}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat preview */}
        <div className="bg-base-100 rounded-2xl border border-base-300/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-base-300/60">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40">Preview</h2>
          </div>

          <div className="p-4 bg-base-200/30">
            <div className="bg-base-100 rounded-xl border border-base-300/60 overflow-hidden max-w-sm mx-auto shadow-sm">
              {/* Mock header */}
              <div className="px-4 py-2.5 border-b border-base-300/60 flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-semibold">
                  J
                </div>
                <div>
                  <p className="text-xs font-semibold">Jane Doe</p>
                  <p className="text-[10px] text-emerald-500">Active now</p>
                </div>
              </div>

              {/* Mock messages */}
              <div className="px-4 py-4 space-y-2.5 min-h-[140px]">
                {PREVIEW_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs
                        ${msg.isSent
                          ? "bg-primary text-primary-content rounded-br-sm"
                          : "bg-base-200 text-base-content rounded-bl-sm"
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock input */}
              <div className="px-3 py-2.5 border-t border-base-300/60 flex gap-2 items-center">
                <input
                  type="text"
                  readOnly
                  value="This is a preview…"
                  className="flex-1 bg-base-200/60 border border-base-300/60 rounded-xl px-3 py-1.5 text-xs text-base-content/40 focus:outline-none cursor-default"
                />
                <button className="p-1.5 rounded-lg bg-primary text-primary-content">
                  <Send className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
