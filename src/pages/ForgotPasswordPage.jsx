import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, isResettingPassword } = useAuthStore();
  const [step, setStep] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const set = (key) => (event) => setFormData({ ...formData, [key]: event.target.value });

  const requestOtp = async () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");

    try {
      await forgotPassword(formData.email);
      setStep("reset");
      setResendTimer(30);
    } catch (error) {
      if (error.response?.data?.remainingSeconds) {
        setResendTimer(error.response.data.remainingSeconds);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await forgotPassword(formData.email.trim());
      setResendTimer((value) => (value < 120 ? 120 : 300));
    } catch (error) {
      if (error.response?.data?.remainingSeconds) {
        setResendTimer(error.response.data.remainingSeconds);
      }
    }
  };

  const validateReset = () => {
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/\d/.test(formData.password)) return toast.error("Password must contain at least one number");
    if (!/[@#$!%*?&.]/.test(formData.password)) {
      return toast.error("Password must contain at least one special character");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step === "email") {
      await requestOtp();
      return;
    }

    if (validateReset() !== true) return;

    await resetPassword({
      email: formData.email.trim(),
      otp: formData.otp.trim(),
      password: formData.password,
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-7 animate-fade-up">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {step === "email" ? "Reset password" : "Check your email"}
            </h1>
            <p className="text-sm text-base-content/50">
              {step === "email"
                ? "Enter your email and we will send a reset OTP."
                : `We sent a 6-digit OTP to ${formData.email}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" icon={<Mail className="size-4" />}>
              <input
                type="email"
                className="auth-input pl-9"
                placeholder="you@example.com"
                value={formData.email}
                onChange={set("email")}
                disabled={step === "reset"}
              />
            </Field>

            {step === "reset" && (
              <>
                <Field label="Reset OTP" icon={<ShieldCheck className="size-4" />}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="auth-input pl-9"
                    placeholder="123456"
                    value={formData.otp}
                    onChange={set("otp")}
                    maxLength={6}
                  />
                </Field>

                <Field label="New password" icon={<Lock className="size-4" />}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input pl-9 pr-9"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={set("password")}
                  />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
                </Field>

                <Field label="Confirm new password" icon={<Lock className="size-4" />}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="auth-input pl-9 pr-9"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={set("confirmPassword")}
                  />
                  <EyeToggle
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((value) => !value)}
                  />
                </Field>
              </>
            )}

            <button
              type="submit"
              disabled={isResettingPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-content text-sm font-medium hover:brightness-105 transition-all press disabled:opacity-60"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {step === "email" ? "Sending OTP..." : "Resetting..."}
                </>
              ) : step === "email" ? (
                "Send reset OTP"
              ) : (
                "Reset password"
              )}
            </button>
          </form>

          {step === "reset" && (
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

          <p className="text-sm text-base-content/50 text-center">
            Remembered your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <AuthImagePattern
        title="Secure account recovery"
        subtitle="Reset your password with an email OTP and get back to your conversations."
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

export default ForgotPasswordPage;
