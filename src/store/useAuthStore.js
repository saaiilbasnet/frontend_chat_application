import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://backend-chat-application-kzkr.onrender.com";

const getStoredToken = () => sessionStorage.getItem("jwt") || localStorage.getItem("jwt");

const persistToken = (token) => {
  if (!token || token === "undefined" || token === "null") return;
  sessionStorage.setItem("jwt", token);
  localStorage.setItem("jwt", token);
};

const clearToken = () => {
  sessionStorage.removeItem("jwt");
  localStorage.removeItem("jwt");
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    if (!getStoredToken()) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/check");

      // Persist the refreshed token so the axios interceptor can read it
      // on all subsequent requests (e.g. after a page refresh).
      persistToken(res.data?.token);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      clearToken();
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      persistToken(res.data?.token);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      persistToken(res.data?.token);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      clearToken();
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // ── Global message listener for notifications ──
    // Registered once here so it's alive for the whole session,
    // regardless of whether a chat window is open.
    // Uses dynamic import() to avoid circular ESM imports at module load time.
    let storeModules = null;
    const getStores = async () => {
      if (!storeModules) {
        const [chatMod, notifMod] = await Promise.all([
          import("./useChatStore.js"),
          import("./useNotificationStore.js"),
        ]);
        storeModules = {
          useChatStore: chatMod.useChatStore,
          useNotificationStore: notifMod.useNotificationStore,
        };
      }
      return storeModules;
    };

    socket.on("newMessage", async (newMessage) => {
      const { useChatStore, useNotificationStore } = await getStores();

      const { selectedUser, users } = useChatStore.getState();
      const isMessageSentFromSelectedUser =
        selectedUser && newMessage.senderId === selectedUser._id;

      // Look up sender from cached users list
      const sender = users.find((u) => u._id === newMessage.senderId);
      const notifBody = newMessage.image
        ? "📷 Sent an image"
        : newMessage.text ?? "";

      // In-app bell — always fire for non-active conversations
      if (!isMessageSentFromSelectedUser) {
        useNotificationStore.getState().addNotification({
          id: newMessage._id,
          senderId: newMessage.senderId,
          senderName: sender?.fullName ?? "Someone",
          senderAvatar: sender?.profilePic || "/avatar.png",
          body: notifBody,
          timestamp: newMessage.createdAt ?? new Date().toISOString(),
          user: sender ?? null,
        });
      }

      // OS push notification — only when tab is hidden
      if (document.hidden && Notification.permission === "granted") {
        const osNotif = new Notification(sender?.fullName ?? "New Message", {
          body: notifBody,
          icon: sender?.profilePic || "/avatar.png",
          badge: "/avatar.png",
          tag: `msg-${newMessage.senderId}`,
          renotify: true,
        });
        osNotif.onclick = () => {
          window.focus();
          osNotif.close();
        };
      }
    });

    // Request browser notification permission once the user is authenticated
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  deleteAccount: async () => {
    try {
      await axiosInstance.delete("/auth/delete-account");
      set({ authUser: null });
      clearToken();
      toast.success("Account deleted successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  },
}));
