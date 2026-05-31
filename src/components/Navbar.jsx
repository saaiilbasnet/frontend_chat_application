import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleToggle = (path) => {
    if (location.pathname === path) {
      navigate("/");
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="fixed w-full top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-300/60">
        <div className="container mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group press"
          >
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <MessageSquare className="w-3.5 h-3.5 text-primary-content" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">Zeno</span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-1">
            <NavBtn
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              active={isActive("/settings")}
              onClick={() => handleToggle("/settings")}
            />

            {authUser && (
              <>
                <NavBtn
                  icon={<User className="w-4 h-4" />}
                  label="Profile"
                  active={isActive("/profile")}
                  onClick={() => handleToggle("/profile")}
                />

                <NotificationBell />

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-base-content/60 hover:text-error hover:bg-error/8 transition-all duration-150 press"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        title="Sign out"
        message="You'll be signed out of your account on this device."
        confirmText="Sign out"
      />
    </>
  );
};

const NavBtn = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 press
      ${active
        ? "bg-primary/12 text-primary font-medium"
        : "text-base-content/60 hover:text-base-content hover:bg-base-200"
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default Navbar;
