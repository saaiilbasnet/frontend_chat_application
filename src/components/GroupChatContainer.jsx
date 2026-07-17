import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import { X, Edit3, Trash2, MessageCircle } from "lucide-react";

import GroupHeader from "./GroupHeader";
import GroupMessageInput from "./GroupMessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ConfirmationModal from "./ConfirmationModal";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    groupMessages,
    fetchGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    subscribeToGroupEvents,
    unsubscribeFromGroupEvents,
    editGroupMessage,
    deleteGroupMessage,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    if (!selectedGroup?._id) return;
    fetchGroupMessages(selectedGroup._id);
    subscribeToGroupEvents();
    return () => unsubscribeFromGroupEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup?._id]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  const handleEditSubmit = (e, messageId) => {
    e.preventDefault();
    if (!editMessageText.trim()) return;
    editGroupMessage(messageId, editMessageText);
    setEditingMessageId(null);
    setEditMessageText("");
  };

  const startEdit = (message) => {
    setEditingMessageId(message._id);
    setEditMessageText(message.text || "");
  };

  const handleDelete = (messageId) => {
    setMessageToDelete(messageId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteGroupMessage(messageToDelete);
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-transparent">
        <GroupHeader />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageSkeleton />
        </div>
        <GroupMessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-transparent">
      <GroupHeader />

      {/* Messages area */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 sm:px-4 py-4 space-y-1">
        {groupMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
            <div className="size-12 rounded-2xl bg-base-200/80 flex items-center justify-center">
              <MessageCircle className="size-6 text-base-content/35" />
            </div>
            <p className="text-sm text-base-content/40 text-center">
              No messages yet — say hello!
            </p>
          </div>
        )}

        {groupMessages.map((message, index) => {
          // Resolve senderId (may be populated object or raw id string)
          const senderId =
            typeof message.senderId === "object"
              ? message.senderId?._id
              : message.senderId;
          const senderName =
            typeof message.senderId === "object"
              ? message.senderId?.fullName
              : null;
          const senderPic =
            typeof message.senderId === "object"
              ? message.senderId?.profilePic || "/avatar.png"
              : "/avatar.png";

          const isMine = senderId === authUser._id;

          const prevMsg = groupMessages[index - 1];
          const prevSenderId =
            prevMsg
              ? typeof prevMsg.senderId === "object"
                ? prevMsg.senderId?._id
                : prevMsg.senderId
              : null;

          // Group consecutive messages from same sender within 5 min
          const isGrouped =
            prevMsg &&
            prevSenderId === senderId &&
            new Date(message.createdAt) - new Date(prevMsg.createdAt) < 5 * 60 * 1000;

          return (
            <div
              key={message._id}
              ref={index === groupMessages.length - 1 ? messageEndRef : null}
              className={`flex items-end gap-1.5 sm:gap-2 group animate-fade-up
                ${isMine ? "flex-row-reverse" : "flex-row"}
                ${isGrouped ? "mt-0.5" : "mt-4"}
              `}
            >
              {/* Avatar — only first in block, left side (others' messages) */}
              <div className={`flex-shrink-0 mb-0.5 ${isMine ? "hidden" : "w-6 sm:w-7"}`}>
                {!isMine && !isGrouped ? (
                  <img
                    src={senderPic}
                    alt={senderName || "User"}
                    className="size-6 sm:size-7 rounded-full object-cover ring-1 ring-base-300/10 shadow-sm"
                  />
                ) : (
                  <div className="size-6 sm:size-7" />
                )}
              </div>

              {/* Bubble + actions */}
              <div
                className={`flex items-end gap-1 sm:gap-2 max-w-[86%] sm:max-w-[70%] min-w-0
                  ${isMine ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Edit/Delete actions (hover, own messages only) */}
                {isMine && editingMessageId !== message._id && (
                  <div className="flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-all duration-150 items-center gap-1 mb-1 sm:scale-90 origin-right">
                    <button
                      onClick={() => startEdit(message)}
                      aria-label="Edit group message"
                      className="p-1.5 rounded-lg text-base-content/40 hover:text-base-content hover:bg-base-200/80 border border-base-300/10 backdrop-blur-sm transition-all duration-100 press"
                      title="Edit message"
                    >
                      <Edit3 className="size-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(message._id)}
                      aria-label="Delete group message"
                      className="p-1.5 rounded-lg text-base-content/40 hover:text-error hover:bg-error/10 border border-base-300/10 backdrop-blur-sm transition-all duration-100 press"
                      title="Delete message"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  {/* Sender name — show for first in group block, others only */}
                  {!isMine && !isGrouped && senderName && (
                    <p className="text-[10px] text-base-content/45 font-medium mb-0.5 px-1">
                      {senderName}
                    </p>
                  )}

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
                      message.text && (
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      )
                    )}
                  </div>

                  {/* Timestamp + edited */}
                  {!isGrouped && (
                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
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

      <GroupMessageInput />

      {/* Full-size image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors press"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
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

export default GroupChatContainer;
