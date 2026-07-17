import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { X, Edit3, Trash2 } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ConfirmationModal from "./ConfirmationModal";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteSingleMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEditSubmit = (e, messageId) => {
    e.preventDefault();
    if (!editMessageText.trim()) return;
    editMessage(messageId, editMessageText);
    setEditingMessageId(null);
    setEditMessageText("");
  };

  const startEdit = (message) => {
    setEditingMessageId(message._id);
    setEditMessageText(message.text);
  };

  const handleDelete = (messageId) => {
    setMessageToDelete(messageId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteSingleMessage(messageToDelete);
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-transparent">
        <ChatHeader />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-transparent">
      <ChatHeader />

      {/* Messages area */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 sm:px-4 py-4 space-y-1">
        {messages.map((message, index) => {
          const isMine = message.senderId === authUser._id;
          const prevMsg = messages[index - 1];
          
          // Smart grouping: only group consecutive messages if sent within 5 minutes of each other
          const isGrouped =
            prevMsg &&
            prevMsg.senderId === message.senderId &&
            new Date(message.createdAt) - new Date(prevMsg.createdAt) < 5 * 60 * 1000;

          return (
            <div
              key={message._id}
              ref={index === messages.length - 1 ? messageEndRef : null}
              className={`flex items-end gap-1.5 sm:gap-2 group animate-fade-up
                ${isMine ? "flex-row-reverse" : "flex-row"}
                ${isGrouped ? "mt-0.5" : "mt-4"}
              `}
            >
              {/* Avatar - only show for first in a grouped block */}
              <div className="flex-shrink-0 mb-0.5">
                {!isGrouped ? (
                  <img
                    src={
                      isMine
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="avatar"
                    className="size-6 sm:size-7 rounded-full object-cover ring-1 ring-base-300/10 shadow-sm"
                  />
                ) : (
                  <div className="size-6 sm:size-7" />
                )}
              </div>

              {/* Message bubble + actions */}
              <div className={`flex items-end gap-1 sm:gap-2 max-w-[86%] sm:max-w-[70%] min-w-0 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                {/* Actions — visible on hover, only for own messages */}
                {isMine && editingMessageId !== message._id && (
                  <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-all duration-150 items-center gap-1 mb-1 scale-90 origin-right">
                    <button
                      onClick={() => startEdit(message)}
                      className="p-1.5 rounded-lg text-base-content/40 hover:text-base-content hover:bg-base-200/80 border border-base-300/10 backdrop-blur-sm transition-all duration-100 press"
                      title="Edit message"
                    >
                      <Edit3 className="size-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="p-1.5 rounded-lg text-base-content/40 hover:text-error hover:bg-error/10 border border-base-300/10 backdrop-blur-sm transition-all duration-100 press"
                      title="Delete message"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-3 sm:px-4 py-2 text-sm leading-relaxed shadow-sm transition-all
                      ${isMine
                        ? "bg-primary text-primary-content rounded-br-sm"
                        : "bg-base-200/90 border border-base-300/40 text-base-content rounded-bl-sm"
                      }`}
                  >
                    {/* Image attachment */}
                    {message.image && (
                      <div className="relative overflow-hidden rounded-lg mb-1.5 border border-base-300/30">
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[190px] sm:max-w-[220px] rounded-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200"
                          onClick={() => setSelectedImage(message.image)}
                        />
                      </div>
                    )}

                    {/* Text or edit form */}
                    {editingMessageId === message._id ? (
                      <form
                        onSubmit={(e) => handleEditSubmit(e, message._id)}
                        className="flex items-center gap-2 py-0.5"
                      >
                        <input
                          type="text"
                          className="bg-primary-content/12 text-inherit rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-content/40 flex-1 min-w-0"
                          value={editMessageText}
                          onChange={(e) => setEditMessageText(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 whitespace-nowrap press"
                          onClick={() => setEditingMessageId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-[10px] font-bold uppercase tracking-wider opacity-90 hover:opacity-100 whitespace-nowrap press"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    )}
                  </div>

                  {/* Timestamp + edited status */}
                  {!isGrouped && (
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                      <time className="text-[9px] text-base-content/30 font-medium tracking-tight">
                        {formatMessageTime(message.createdAt)}
                      </time>
                      {message.isEdited && (
                        <span className="text-[9px] text-base-content/25 italic">· edited</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />

      {/* Full-size image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors press"
            onClick={() => setSelectedImage(null)}
          >
            <X className="size-5" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete message modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete message"
        message="This message will be permanently removed. This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default ChatContainer;
