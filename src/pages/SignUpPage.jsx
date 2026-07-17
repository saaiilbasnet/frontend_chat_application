import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, verifyOtp, resendOtp, isSigningUp, requireOtp, signupEmail } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (requireOtp && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [requireOtp, resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp();
      setResendTimer((prev) => (prev < 120 ? 120 : 300));
    } catch (error) {
      if (error.response?.data?.remainingSeconds) {
        setResendTimer(error.response.data.remainingSeconds);
      }
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/\d/.test(formData.password)) return toast.error("Password must contain at least one number");
    if (!/[@#$!%*?&.]/.test(formData.password)) return toast.error("Password must contain at least one special character");
    if (!formData.confirmPassword) return toast.error("Please confirm your password");
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requireOtp) {
      if (!otp.trim() || otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP");
      await verifyOtp(otp);
      navigate("/", { replace: true });
    } else {
      if (validateForm() === true) await signup(formData);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-7 animate-fade-up">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{requireOtp ? "Verify Email" : "Create an account"}</h1>
            <p className="text-sm text-base-content/50">{requireOtp ? `We sent an OTP to ${signupEmail}` : "Get started with Zeno — it's free"}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {requireOtp ? (
              <Field label="Verification Code (OTP)" icon={<Lock className="size-4" />}>
                <input
                  type="text"
                  className="auth-input pl-9"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </Field>
            ) : (
              <>
                <Field label="Full name" icon={<User className="size-4" />}>
                  <input
                    type="text"
                    className="auth-input pl-9"
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={set("fullName")}
                  />
                </Field>

                <Field label="Email" icon={<Mail className="size-4" />}>
                  <input
                    type="email"
                    className="auth-input pl-9"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={set("email")}
                  />
                </Field>

                <Field label="Password" icon={<Lock className="size-4" />}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input pl-9 pr-9"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={set("password")}
                  />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                </Field>

                <Field label="Confirm password" icon={<Lock className="size-4" />}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="auth-input pl-9 pr-9"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={set("confirmPassword")}
                  />
                  <EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />
                </Field>
              </>
            )}

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-content text-sm font-medium hover:brightness-105 transition-all press disabled:opacity-60"
            >
              {isSigningUp ? (
                <><Loader2 className="size-4 animate-spin" /> {requireOtp ? "Verifying..." : "Creating account…"}</>
              ) : (requireOtp ? "Verify OTP" : "Create account")}
            </button>
          </form>

          {requireOtp && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive code? Resend OTP"}
              </button>
            </div>
          )}

          {!requireOtp && (
            <p className="text-sm text-base-content/50 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Pattern side */}
      <AuthImagePattern
        title="Join the conversation"
        subtitle="Connect with friends, share moments, and stay close — wherever you are."
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

const EyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
    onClick={onToggle}
  >
    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
  </button>
);

export default SignUpPage;
