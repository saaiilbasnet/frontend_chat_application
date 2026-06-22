import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const hasStoredToken = () => Boolean(sessionStorage.getItem("jwt") || localStorage.getItem("jwt"));

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  searchResults: [],
  sentRequests: [],
  receivedRequests: [],
  blockedUsers: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isFriendsLoading: false,
  isSearchingUsers: false,

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

  getFriendState: async () => {
    if (!hasStoredToken()) {
      set({
        users: [],
        sentRequests: [],
        receivedRequests: [],
        blockedUsers: [],
        isFriendsLoading: false,
      });
      return;
    }

    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({
        users: res.data.friends || [],
        sentRequests: res.data.sentRequests || [],
        receivedRequests: res.data.receivedRequests || [],
        blockedUsers: res.data.blockedUsers || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friends");
    } finally {
      set({ isFriendsLoading: false });
    }
  },

  searchUsersByName: async (fullName) => {
    const query = fullName.trim();
    if (query.length < 2 || !hasStoredToken()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearchingUsers: true });
    try {
      const res = await axiosInstance.get("/friends/search", {
        params: { fullName: query },
      });
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users");
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post(`/friends/request/${userId}`);
      toast.success(res.data?.message || "Friend request sent");
      await get().getFriendState();
      set((state) => ({
        searchResults: state.searchResults.map((user) =>
          user._id === userId ? { ...user, relationship: "request_sent" } : user
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/accept/${userId}`);
      toast.success("Friend request accepted");
      await get().getFriendState();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/decline/${userId}`);
      toast.success("Friend request declined");
      await get().getFriendState();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  },

  unfriendUser: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user._id !== userId),
        selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
        messages: state.selectedUser?._id === userId ? [] : state.messages,
      }));
      toast.success("User unfriended");
      await get().getFriendState();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unfriend user");
    }
  },

  blockUser: async (userId) => {
    try {
      await axiosInstance.post(`/friends/block/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user._id !== userId),
        searchResults: state.searchResults.map((user) =>
          user._id === userId ? { ...user, relationship: "blocked" } : user
        ),
        selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
        messages: state.selectedUser?._id === userId ? [] : state.messages,
      }));
      toast.success("User blocked");
      await get().getFriendState();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    }
  },

  unblockUser: async (userId) => {
    try {
      await axiosInstance.post(`/friends/unblock/${userId}`);
      toast.success("User unblocked");
      await get().getFriendState();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock user");
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
