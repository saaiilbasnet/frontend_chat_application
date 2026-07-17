/**
 * Auth page right-panel — geometric dot grid with animated accents.
 * Replaces the old pulsing squares with a precise, minimal pattern.
 */
const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200/60 p-12 relative overflow-hidden">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative max-w-xs text-center space-y-3 animate-fade-up">
        {/* Small Zeno wordmark */}
        <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-bold text-sm tracking-tight">Z</span>
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-base-content/50 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
