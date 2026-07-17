import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-base-content/50">Sign in to continue to Zeno</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email"
              icon={<Mail className="size-4" />}
            >
              <input
                type="email"
                className="auth-input pl-9"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Field>

            <Field
              label="Password"
              icon={<Lock className="size-4" />}
            >
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input pl-9 pr-9"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </Field>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-content text-sm font-medium hover:brightness-105 transition-all press disabled:opacity-60"
            >
              {isLoggingIn ? (
                <><Loader2 className="size-4 animate-spin" /> Signing in…</>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-base-content/50 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Pattern side */}
      <AuthImagePattern
        title="Welcome back to Zeno"
        subtitle="Sign in to continue your conversations and catch up with your messages."
      />
    </div>
  );
};

const Field = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-base-content/60">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35">
        {icon}
      </span>
      {children}
    </div>
  </div>
);

export default LoginPage;
