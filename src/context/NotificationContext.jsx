import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAsUnread: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  createNotification: async () => {},
  refreshNotifications: async () => {},
  inAppNotifEnabled: true,
  setInAppNotifEnabled: () => {},
});

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inAppNotifEnabled, setInAppNotifEnabledState] = useState(true);

  // Load preference
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`pawlio_pref_in_app_${user.id}`);
      setInAppNotifEnabledState(stored !== "false");
    }
  }, [user?.id]);

  const setInAppNotifEnabled = (enabled) => {
    setInAppNotifEnabledState(enabled);
    if (user?.id) {
      localStorage.setItem(`pawlio_pref_in_app_${user.id}`, String(enabled));
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("fetchNotifications error:", error);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("fetchNotifications exception:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    if (!user?.id || !notificationId) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("markAsRead error:", error);
        // Rollback on failure
        await fetchNotifications();
        throw new Error("Unable to mark notification as read.");
      }
    } catch (err) {
      console.error("markAsRead exception:", err);
      await fetchNotifications();
      throw err;
    }
  };

  const markAsUnread = async (notificationId) => {
    if (!user?.id || !notificationId) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n))
    );

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: false })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("markAsUnread error:", error);
        await fetchNotifications();
        throw new Error("Unable to mark notification as unread.");
      }
    } catch (err) {
      console.error("markAsUnread exception:", err);
      await fetchNotifications();
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    const unread = notifications.filter((n) => !n.is_read);
    const unreadIds = unread.map((n) => n.id).filter(Boolean);

    // Immediate optimistic local update across all notification state
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      // 1. Direct standard Supabase update scoped strictly to the authenticated user
      // Conceptually: UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false
      const { error: queryError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      // 2. Also ensure any explicitly unread IDs or NULL is_read rows are caught
      if (unreadIds.length > 0) {
        const { error: idError } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .in("id", unreadIds);

        if (idError && queryError) {
          console.error("markAllAsRead failed on both batch and ID update:", idError);
          await fetchNotifications();
          throw new Error("Unable to mark notifications as read. Please try again.");
        }
      } else if (queryError) {
        console.error("markAllAsRead query failed:", queryError);
        await fetchNotifications();
        throw new Error("Unable to mark notifications as read. Please try again.");
      }

      // 3. Re-sync with server to confirm final state
      await fetchNotifications();
    } catch (err) {
      console.error("markAllAsRead exception:", err);
      await fetchNotifications();
      throw err;
    }
  };

  const createNotification = async ({ title, message, type = "general" }) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: title || "New Notification",
          message: message || "You have a new update.",
          type: type || "general",
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("createNotification error:", error);
        throw error;
      }

      await fetchNotifications();
      return data;
    } catch (err) {
      console.error("createNotification exception:", err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user?.id || !notificationId) return;

    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("deleteNotification error:", error);
        await fetchNotifications();
        throw new Error("Unable to delete notification.");
      }
    } catch (err) {
      console.error("deleteNotification exception:", err);
      await fetchNotifications();
      throw err;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    createNotification,
    deleteNotification,
    refreshNotifications: fetchNotifications,
    inAppNotifEnabled,
    setInAppNotifEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
