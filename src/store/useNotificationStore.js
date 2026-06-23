import { create } from "zustand";

/**
 * In-app notification store.
 * Each notification entry:
 *   { id, senderId, senderName, senderAvatar, body, timestamp, user (full user object) }
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [], // array of notification objects

  /** Called when a new message arrives from a background conversation */
  addNotification: (notification) => {
    const existing = get().notifications;

    // If there's already a notification from this sender, replace it
    // (we just bump the count instead of stacking duplicates)
    const notificationType = notification.type ?? "message";
    const existingNotification = existing.find(
      (n) => n.senderId === notification.senderId && (n.type ?? "message") === notificationType
    );
    const filtered = existing.filter(
      (n) => n.senderId !== notification.senderId || (n.type ?? "message") !== notificationType
    );

    set({
      notifications: [
        ...filtered,
        {
          ...notification,
          type: notificationType,
          count: (existingNotification?.count ?? 0) + 1,
        },
      ],
    });
  },

  /** Clear notifications from a specific sender (user opened that chat) */
  clearBySender: (senderId) => {
    set({
      notifications: get().notifications.filter(
        (n) => n.senderId !== senderId
      ),
    });
  },

  /** Clear all notifications */
  clearAll: () => set({ notifications: [] }),
}));
