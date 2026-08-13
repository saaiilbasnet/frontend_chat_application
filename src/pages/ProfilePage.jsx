import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Lock } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const {
    authUser,
    isUpdatingProfile,
    updateProfile,
    deleteAccount,
    requireEmailChangeOtp,
    pendingEmail,
    verifyEmailChange,
    resendEmailChangeOtp,
  } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [emailOtp, setEmailOtp] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const handleVerifyEmailChange = async () => {
    if (!emailOtp.trim() || emailOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    setIsVerifyingEmail(true);
    try {
      await verifyEmailChange(emailOtp);
      setEmailOtp("");
    } catch {
      // toast already shown by the store
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-16 pb-12 bg-base-200/40">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4 animate-fade-up">
        {/* Page title */}
        <div className="px-1 mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-base-content/40 mt-0.5">Manage your personal information</p>
        </div>

        {/* Avatar card */}
        <Card>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-20 rounded-2xl object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute -bottom-1.5 -right-1.5 size-7 rounded-lg bg-base-content
                  flex items-center justify-center cursor-pointer hover:scale-105 transition-transform press
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="size-3.5 text-base-100" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            <div>
              <p className="font-semibold">{authUser.fullName}</p>
              <p className="text-sm text-base-content/50">{authUser.email}</p>
              <p className="text-xs text-base-content/30 mt-1">
                {isUpdatingProfile ? "Uploading photo…" : "Click camera to update"}
              </p>
            </div>
          </div>
        </Card>

        {/* Edit info card */}
        <Card title="Personal info">
          <div className="space-y-4">
            <InputField
              label="Full name"
              icon={<User className="size-4" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <InputField
              label="Email address"
              icon={<Mail className="size-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
            />

            <button
              onClick={() => updateProfile({ fullName, email })}
              disabled={isUpdatingProfile}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-content text-sm font-medium hover:brightness-105 transition-all press disabled:opacity-60"
            >
              {isUpdatingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        </Card>

        {/* Account info */}
        <Card title="Account">
          <div className="space-y-0 divide-y divide-base-300/60 text-sm">
            <Row label="Member since" value={authUser.createdAt?.split("T")[0]} mono />
            <Row label="Status" value="Active" valueClass="text-emerald-500 font-medium" />
          </div>
        </Card>

        {/* Danger zone */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-error">Delete account</p>
              <p className="text-xs text-base-content/40 mt-0.5">Permanently removes all your data</p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-error/30 text-error text-sm font-medium hover:bg-error/8 transition-all press"
            >
              Delete
            </button>
          </div>
        </Card>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          deleteAccount();
        }}
        title="Delete account"
        message="Your account and all data will be permanently deleted. This cannot be undone."
        confirmText="Delete account"
      />

      {requireEmailChangeOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-base-100 border border-base-300/80 w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Verify new email</h3>
            </div>
            <p className="text-sm text-base-content/60 leading-relaxed mb-4 pl-11">
              We sent a verification code to {pendingEmail}. Enter it below to confirm this email change.
            </p>
            <div className="px-11 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
                className="w-full px-4 py-2.5 bg-base-200/60 rounded-xl border border-base-300/60 text-sm text-center tracking-widest focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                onClick={handleVerifyEmailChange}
                disabled={isVerifyingEmail}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-content text-sm font-medium hover:brightness-105 transition-all press disabled:opacity-60"
              >
                {isVerifyingEmail ? "Verifying…" : "Verify"}
              </button>
              <button
                onClick={() => resendEmailChangeOtp()}
                className="w-full text-xs text-base-content/50 hover:text-base-content transition-colors"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-base-100 rounded-2xl border border-base-300/60 p-5">
    {title && <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">{title}</h2>}
    {children}
  </div>
);

const InputField = ({ label, icon, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-base-content/50">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-base-200/60 rounded-xl border border-base-300/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
      />
    </div>
  </div>
);

const Row = ({ label, value, mono, valueClass }) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-base-content/50">{label}</span>
    <span className={`${mono ? "font-mono text-xs" : ""} ${valueClass || ""}`}>{value}</span>
  </div>
);

export default ProfilePage;
