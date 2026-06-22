import { Ban, Trash2, UserMinus, X } from "lucide-react";
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
    <div className="px-4 py-3 border-b border-base-300/60 flex items-center justify-between bg-transparent">
      {/* User info */}
      <div className="flex items-center gap-3">
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

        <div>
          <h3 className="text-sm font-semibold leading-tight text-base-content">{selectedUser.fullName}</h3>
          <p className={`text-[10px] font-medium ${isOnline ? "text-emerald-500" : "text-base-content/40"}`}>
            {isOnline ? "Active now" : "Offline"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsUnfriendModalOpen(true)}
          className="p-2 rounded-xl text-base-content/40 hover:text-warning hover:bg-warning/10 border border-transparent hover:border-warning/10 transition-all duration-150 press"
          title="Unfriend"
        >
          <UserMinus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsBlockModalOpen(true)}
          className="p-2 rounded-xl text-base-content/40 hover:text-error hover:bg-error/8 border border-transparent hover:border-error/10 transition-all duration-150 press"
          title="Block"
        >
          <Ban className="w-4 h-4" />
        </button>
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
