import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  // Socket handler refs stored in state for clean removal
  _groupHandlers: null,

  // ── API Actions ──────────────────────────────────────────────────────────

  fetchGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (name, description, memberIds) => {
    try {
      const res = await axiosInstance.post("/groups", { name, description, memberIds });
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Group created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  selectGroup: (group) => {
    set({ selectedGroup: group, groupMessages: [] });
  },

  fetchGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/send`, messageData);
      set((state) => ({ groupMessages: [...state.groupMessages, res.data] }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  addGroupMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
      }));
      toast.success("Member added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  },

  removeGroupMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
      }));
      toast.success("Member removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages,
      }));
      toast.success("Left the group");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages,
      }));
      toast.success("Group deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
    }
  },

  updateGroup: async (groupId, data) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, data);
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
      }));
      toast.success("Group updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
    }
  },

  editGroupMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/groups/messages/${messageId}`, { text });
      set((state) => ({
        groupMessages: state.groupMessages.map((m) => (m._id === messageId ? res.data : m)),
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to edit message");
    }
  },

  deleteGroupMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/groups/messages/${messageId}`);
      set((state) => ({
        groupMessages: state.groupMessages.filter((m) => m._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  // ── Socket Subscription ──────────────────────────────────────────────────

  subscribeToGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Build handlers that close over `get()` so they always read latest state
    const onNewGroupMessage = (message) => {
      const { selectedGroup, groupMessages } = get();
      if (message.groupId !== selectedGroup?._id) return;
      if (groupMessages.some((m) => m._id === message._id)) return;
      set((state) => ({ groupMessages: [...state.groupMessages, message] }));
    };

    const onGroupMessageEdited = (message) => {
      set((state) => ({
        groupMessages: state.groupMessages.map((m) =>
          m._id === message._id ? message : m
        ),
      }));
    };

    const onGroupMessageDeleted = ({ messageId }) => {
      set((state) => ({
        groupMessages: state.groupMessages.filter((m) => m._id !== messageId),
      }));
    };

    const onGroupMemberAdded = (updatedGroup) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        ),
        selectedGroup:
          state.selectedGroup?._id === updatedGroup._id
            ? updatedGroup
            : state.selectedGroup,
      }));
    };

    const onGroupMemberRemoved = ({ groupId, userId, newAdmin, updatedGroup }) => {
      const currentUserId = useAuthStore.getState().authUser?._id;
      if (userId === currentUserId) {
        // Current user was removed
        set((state) => ({
          groups: state.groups.filter((g) => g._id !== groupId),
          selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
          groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages,
        }));
        toast("You were removed from the group", { icon: "👋" });
      } else if (updatedGroup) {
        set((state) => ({
          groups: state.groups.map((g) => (g._id === groupId ? updatedGroup : g)),
          selectedGroup:
            state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
        }));
      } else {
        // Fallback: update member list manually
        set((state) => ({
          groups: state.groups.map((g) =>
            g._id === groupId
              ? {
                  ...g,
                  members: g.members.filter((m) => {
                    const id = typeof m === "object" ? m._id : m;
                    return id !== userId;
                  }),
                  ...(newAdmin ? { admin: newAdmin } : {}),
                }
              : g
          ),
          selectedGroup:
            state.selectedGroup?._id === groupId
              ? {
                  ...state.selectedGroup,
                  members: state.selectedGroup.members.filter((m) => {
                    const id = typeof m === "object" ? m._id : m;
                    return id !== userId;
                  }),
                  ...(newAdmin ? { admin: newAdmin } : {}),
                }
              : state.selectedGroup,
        }));
      }
    };

    const onGroupUpdated = (updatedGroup) => {
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === updatedGroup._id ? updatedGroup : g
        ),
        selectedGroup:
          state.selectedGroup?._id === updatedGroup._id
            ? updatedGroup
            : state.selectedGroup,
      }));
    };

    const onGroupDeleted = ({ groupId }) => {
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup:
          state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        groupMessages:
          state.selectedGroup?._id === groupId ? [] : state.groupMessages,
      }));
    };

    const onGroupCreated = (newGroup) => {
      set((state) => {
        if (state.groups.some((g) => g._id === newGroup._id)) return state;
        return { groups: [newGroup, ...state.groups] };
      });
    };

    // Register all listeners
    socket.on("newGroupMessage", onNewGroupMessage);
    socket.on("groupMessageEdited", onGroupMessageEdited);
    socket.on("groupMessageDeleted", onGroupMessageDeleted);
    socket.on("groupMemberAdded", onGroupMemberAdded);
    socket.on("groupMemberRemoved", onGroupMemberRemoved);
    socket.on("groupUpdated", onGroupUpdated);
    socket.on("groupDeleted", onGroupDeleted);
    socket.on("groupCreated", onGroupCreated);

    // Store references for cleanup
    set({
      _groupHandlers: {
        onNewGroupMessage,
        onGroupMessageEdited,
        onGroupMessageDeleted,
        onGroupMemberAdded,
        onGroupMemberRemoved,
        onGroupUpdated,
        onGroupDeleted,
        onGroupCreated,
      },
    });
  },

  unsubscribeFromGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    const { _groupHandlers } = get();
    if (!socket || !_groupHandlers) return;

    socket.off("newGroupMessage", _groupHandlers.onNewGroupMessage);
    socket.off("groupMessageEdited", _groupHandlers.onGroupMessageEdited);
    socket.off("groupMessageDeleted", _groupHandlers.onGroupMessageDeleted);
    socket.off("groupMemberAdded", _groupHandlers.onGroupMemberAdded);
    socket.off("groupMemberRemoved", _groupHandlers.onGroupMemberRemoved);
    socket.off("groupUpdated", _groupHandlers.onGroupUpdated);
    socket.off("groupDeleted", _groupHandlers.onGroupDeleted);
    socket.off("groupCreated", _groupHandlers.onGroupCreated);

    set({ _groupHandlers: null });
  },
}));
