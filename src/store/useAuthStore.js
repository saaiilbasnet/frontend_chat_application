import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isResettingPassword: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  requireOtp: false,
  signupEmail: null,
  requireEmailChangeOtp: false,
  pendingEmail: null,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.data.requireOtp) {
        set({ requireOtp: true, signupEmail: res.data.email });
        toast.success(res.data.message || "OTP sent to email");
      } else {
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (otp) => {
    set({ isSigningUp: true });
    try {
      const { signupEmail } = get();
      const res = await axiosInstance.post("/auth/verify-otp", { email: signupEmail, otp });
      set({ requireOtp: false, signupEmail: null });
      set({ authUser: res.data });
      toast.success("Account verified successfully");
      get().connectSocket();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  resendOtp: async () => {
    try {
      const { signupEmail } = get();
      const res = await axiosInstance.post("/auth/resend-otp", { email: signupEmail });
      toast.success(res.data.message || "OTP resent successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      toast.success(res.data.message || "Password reset OTP sent");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset OTP");
      throw error;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  resetPassword: async ({ email, otp, password }) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", { email, otp, password });
      set({ authUser: res.data });
      get().connectSocket();
      toast.success(res.data.message || "Password reset successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      throw error;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
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
      if (res.data.requireEmailOtp) {
        set({ requireEmailChangeOtp: true, pendingEmail: res.data.pendingEmail });
        toast.success(res.data.message || "OTP sent to your new email");
      } else {
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  verifyEmailChange: async (otp) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email-change", { otp });
      set({ authUser: res.data, requireEmailChangeOtp: false, pendingEmail: null });
      toast.success("Email updated successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  resendEmailChangeOtp: async () => {
    try {
      const res = await axiosInstance.post("/auth/resend-email-change-otp");
      toast.success(res.data.message || "OTP resent successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      throw error;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
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

      const { selectedUser, users, getFriendState } = useChatStore.getState();
      const isMessageSentFromSelectedUser =
        selectedUser && newMessage.senderId === selectedUser._id;

      // Look up sender from cached users list
      let sender = users.find((u) => u._id === newMessage.senderId);
      if (!sender) {
        await getFriendState();
        sender = useChatStore
          .getState()
          .users.find((u) => u._id === newMessage.senderId);
      }

      const fallbackSender = {
        _id: newMessage.senderId,
        fullName: sender?.fullName ?? "New message",
        profilePic: sender?.profilePic || "/avatar.png",
      };
      const notifBody = newMessage.image ? "Sent an image" : newMessage.text ?? "";

      // In-app bell — always fire for non-active conversations
      if (!isMessageSentFromSelectedUser) {
        useNotificationStore.getState().addNotification({
          id: newMessage._id,
          type: "message",
          senderId: newMessage.senderId,
          senderName: fallbackSender.fullName,
          senderAvatar: fallbackSender.profilePic,
          body: notifBody,
          timestamp: newMessage.createdAt ?? new Date().toISOString(),
          user: sender ?? fallbackSender,
        });
      }

      // OS push notification — only when tab is hidden
      if (document.hidden && Notification.permission === "granted") {
        const osNotif = new Notification(fallbackSender.fullName, {
          body: notifBody,
          icon: fallbackSender.profilePic,
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

    socket.on("friendRequestReceived", async ({ user }) => {
      const { useChatStore, useNotificationStore } = await getStores();

      await useChatStore.getState().getFriendState();
      useNotificationStore.getState().addNotification({
        id: `friend-request-${user._id}`,
        type: "friend_request",
        senderId: user._id,
        senderName: user.fullName ?? "New request",
        senderAvatar: user.profilePic || "/avatar.png",
        body: "Sent you a friend request",
        timestamp: new Date().toISOString(),
        user,
      });
    });

    socket.on("friendRequestAccepted", async ({ user }) => {
      const { useChatStore, useNotificationStore } = await getStores();

      await useChatStore.getState().getFriendState();
      useNotificationStore.getState().addNotification({
        id: `friend-accepted-${user._id}`,
        type: "friend_accept",
        senderId: user._id,
        senderName: user.fullName ?? "Friend request accepted",
        senderAvatar: user.profilePic || "/avatar.png",
        body: "Accepted your friend request",
        timestamp: new Date().toISOString(),
        user,
      });
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
      toast.success("Account deleted successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  },
}));
