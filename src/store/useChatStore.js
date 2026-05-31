import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteChat: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      await axiosInstance.delete(`/messages/delete/${userId}`);
      set({ messages: [] });
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete chat");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, {
        text: newText,
      });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to edit message");
    }
  },

  deleteSingleMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Store handler reference so we can remove ONLY this listener later,
    // without touching the global newMessage listener in useAuthStore.
    const newMessageHandler = (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    };

    const messageEditedHandler = (editedMessage) => {
      if (editedMessage.senderId !== selectedUser._id && editedMessage.receiverId !== selectedUser._id) return;
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === editedMessage._id ? editedMessage : msg
        ),
      }));
    };

    const messageDeletedHandler = (messageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    };

    set({ 
      _messageHandler: newMessageHandler,
      _messageEditedHandler: messageEditedHandler,
      _messageDeletedHandler: messageDeletedHandler,
    });
    
    socket.on("newMessage", newMessageHandler);
    socket.on("messageEdited", messageEditedHandler);
    socket.on("messageDeleted", messageDeletedHandler);
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { _messageHandler, _messageEditedHandler, _messageDeletedHandler } = get();
    
    if (_messageHandler) socket.off("newMessage", _messageHandler);
    if (_messageEditedHandler) socket.off("messageEdited", _messageEditedHandler);
    if (_messageDeletedHandler) socket.off("messageDeleted", _messageDeletedHandler);
    
    set({ 
      _messageHandler: null,
      _messageEditedHandler: null,
      _messageDeletedHandler: null,
    });
  },

  setSelectedUser: (selectedUser) => {
    // Clear bell notifications for this sender when opening their chat
    if (selectedUser?._id) {
      import("./useNotificationStore.js").then(({ useNotificationStore }) => {
        useNotificationStore.getState().clearBySender(selectedUser._id);
      });
    }
    set({ selectedUser });
  },
}));
