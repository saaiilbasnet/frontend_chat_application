import { useRef, useState, useEffect } from "react";
import { Bell, X, MessageCircle } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";

/**
 * Notification bell with dropdown panel.
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, clearAll, clearBySender } = useNotificationStore();
  const { users, getFriendState, setSelectedUser, setActiveSidebarTab } = useChatStore();

  const unreadCount = notifications.reduce((sum, n) => sum + (n.count ?? 1), 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notif) => {
    let user = notif.user || users.find((item) => item._id === notif.senderId);

    if (!user) {
      await getFriendState();
      user = useChatStore
        .getState()
        .users.find((item) => item._id === notif.senderId);
    }

    if (notif.type === "friend_request") {
      setSelectedUser(null);
      setActiveSidebarTab("requests");
    } else {
      setSelectedUser(
        user || {
          _id: notif.senderId,
          fullName: notif.senderName || "New message",
          profilePic: notif.senderAvatar || "/avatar.png",
        },
      );
      setActiveSidebarTab("friends");
    }
    clearBySender(notif.senderId);
    navigate("/");
    setIsOpen(false);
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex items-center justify-center p-2 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-all duration-150 press"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-error-content text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-72 bg-base-100/90 backdrop-blur-xl border border-base-300/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/60">
            <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest flex items-center gap-1.5">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1.5 rounded-full bg-primary text-primary-content text-[9px] font-extrabold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </span>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[10px] font-semibold text-base-content/40 hover:text-error transition-colors press"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-base-content/30">
                <MessageCircle className="size-6 text-base-content/20" />
                <p className="text-xs">All caught up</p>
              </div>
            ) : (
              <ul className="divide-y divide-base-300/40">
                {[...notifications].reverse().map((notif) => (
                  <li key={notif.senderId}>
                    <div
                      role="button"
                      tabIndex={0}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors text-left group cursor-pointer"
                      onClick={() => handleNotificationClick(notif)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNotificationClick(notif);
                        }
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={notif.senderAvatar}
                          alt={notif.senderName}
                          className="size-8.5 rounded-full object-cover ring-1 ring-base-300/30 transition-transform duration-100 group-hover:scale-105"
                        />
                        {notif.count > 1 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-content text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                            {notif.count}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-base-content">{notif.senderName}</p>
                        <p className="text-[11px] text-base-content/50 truncate font-medium">{notif.body}</p>
                      </div>

                      {/* Time + dismiss */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[9px] font-medium text-base-content/30">{formatTime(notif.timestamp)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearBySender(notif.senderId);
                          }}
                          className="p-1 rounded bg-transparent hover:bg-error/10 text-base-content/30 hover:text-error transition-all duration-100 press"
                          title="Dismiss notification"
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
