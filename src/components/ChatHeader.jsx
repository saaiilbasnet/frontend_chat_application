import { Ban, Mail, Trash2, User, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ConfirmationModal from "./ConfirmationModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, deleteChat, unfriendUser, blockUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnfriendModalOpen, setIsUnfriendModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleDeleteChat = async () => {
    setIsDeleteModalOpen(false);
    await deleteChat(selectedUser._id);
  };

  const handleUnfriend = async () => {
    setIsUnfriendModalOpen(false);
    await unfriendUser(selectedUser._id);
  };

  const handleBlock = async () => {
    setIsBlockModalOpen(false);
    await blockUser(selectedUser._id);
  };

  return (
    <div className="px-3 sm:px-4 py-3 border-b border-base-300/60 flex items-center justify-between gap-2 bg-transparent">
      <button
        onClick={() => setIsProfileOpen(true)}
        className="flex items-center gap-3 min-w-0 text-left rounded-xl pr-3 py-1 hover:bg-base-200/50 transition-all duration-150 press"
        title="View profile"
      >
        <div className="relative flex-shrink-0">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="size-9 rounded-full object-cover ring-1 ring-base-300/30"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full ring-2 ring-base-100 pulse-dot" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight text-base-content truncate">
            {selectedUser.fullName}
          </h3>
          <p className={`text-[10px] font-medium ${isOnline ? "text-emerald-500" : "text-base-content/40"}`}>
            {isOnline ? "Active now" : "Offline"}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="p-2 rounded-xl text-base-content/40 hover:text-error hover:bg-error/8 border border-transparent hover:border-error/10 transition-all duration-150 press"
          title="Delete conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200/80 border border-transparent hover:border-base-300/10 transition-all duration-150 press"
          title="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsProfileOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-base-100 border border-base-300/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-base-300/60 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt={selectedUser.fullName}
                    className="size-14 rounded-2xl object-cover ring-1 ring-base-300/40"
                  />
                  {isOnline && (
                    <span className="absolute bottom-1 right-1 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold truncate">{selectedUser.fullName}</h3>
                  <p className={`text-xs font-medium ${isOnline ? "text-emerald-500" : "text-base-content/40"}`}>
                    {isOnline ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 rounded-xl text-base-content/40 hover:text-base-content hover:bg-base-200/80 transition-all duration-150 press"
                title="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-base-content/70">
                <div className="size-9 rounded-xl bg-base-200/70 flex items-center justify-center text-base-content/45">
                  <User className="size-4" />
                </div>
                <span className="truncate">{selectedUser.fullName}</span>
              </div>
              {selectedUser.email && (
                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <div className="size-9 rounded-xl bg-base-200/70 flex items-center justify-center text-base-content/45">
                    <Mail className="size-4" />
                  </div>
                  <span className="truncate">{selectedUser.email}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsUnfriendModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-warning bg-warning/10 hover:bg-warning/15 transition-all duration-150 press"
                >
                  <UserMinus className="size-4" />
                  Unfriend
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsBlockModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-error bg-error/10 hover:bg-error/15 transition-all duration-150 press"
                >
                  <Ban className="size-4" />
                  Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChat}
        title="Delete conversation"
        message={`This will permanently delete your conversation with ${selectedUser.fullName}. This cannot be undone.`}
      />
      <ConfirmationModal
        isOpen={isUnfriendModalOpen}
        onClose={() => setIsUnfriendModalOpen(false)}
        onConfirm={handleUnfriend}
        title="Unfriend user"
        message={`Remove ${selectedUser.fullName} from your friends? You will need to send a new request before chatting again.`}
        confirmText="Unfriend"
      />
      <ConfirmationModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlock}
        title="Block user"
        message={`Block ${selectedUser.fullName}? This removes the friendship and prevents messages or friend requests.`}
        confirmText="Block"
      />
    </div>
  );
};

export default ChatHeader;
