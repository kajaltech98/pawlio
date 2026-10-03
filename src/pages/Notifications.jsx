import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  CalendarCheck,
  ShieldCheck,
  Heart,
  ArrowLeft,
  Filter,
  Plus,
  RotateCcw,
} from "lucide-react";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import { useNotifications } from "../context/NotificationContext";
import { formatNotificationTime } from "../lib/notificationService";
import "../components/notifications/notifications.css";

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    createNotification,
    deleteNotification,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [creatingTest, setCreatingTest] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleMarkSingle = async (id) => {
    try {
      setUpdatingId(id);
      setErrorMsg("");
      await markAsRead(id);
    } catch (err) {
      console.error("[PAWLIO] Mark single error:", err);
      setErrorMsg("Unable to mark notification as read.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkUnread = async (id) => {
    try {
      setUpdatingId(id);
      setErrorMsg("");
      await markAsUnread(id);
    } catch (err) {
      console.error("[PAWLIO] Mark unread error:", err);
      setErrorMsg("Unable to mark notification as unread.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateTestAlert = async () => {
    try {
      setCreatingTest(true);
      setErrorMsg("");
      await createNotification({
        title: "Vaccination Reminder (Test)",
        message: "Rabies Booster vaccination is scheduled soon for your pet.",
        type: "vaccination",
      });
      setSuccessMsg("Test unread notification created. You can now test 'Mark all as read'.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("[PAWLIO] Error creating test notification:", err);
      setErrorMsg("Unable to create test notification.");
    } finally {
      setCreatingTest(false);
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0 || markingAll) return;
    try {
      setMarkingAll(true);
      setErrorMsg("");
      console.log("[PAWLIO] Mark all as read - Unread before:", unreadCount);
      await markAllAsRead();
      console.log("[PAWLIO] Mark all as read - Successfully updated database and synced state");
      setSuccessMsg("All notifications marked as read.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("[PAWLIO] Mark all as read error:", err);
      setErrorMsg("Unable to mark notifications as read. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setErrorMsg("");
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to delete notification.");
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "unread") return !item.is_read;
    if (activeFilter === "read") return item.is_read;
    return true;
  });

  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredNotifications.forEach((notif) => {
      const d = new Date(notif.created_at || Date.now());
      d.setHours(0, 0, 0, 0);

      if (d.getTime() >= today.getTime()) {
        groups.Today.push(notif);
      } else if (d.getTime() >= yesterday.getTime()) {
        groups.Yesterday.push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const getIconForType = (type, title) => {
    const lowerType = (type || "").toLowerCase();
    const lowerTitle = (title || "").toLowerCase();

    if (lowerType === "vaccination" || lowerTitle.includes("vaccin")) {
      return (
        <div className="notification-card-icon type-vaccination">
          <ShieldCheck size={20} />
        </div>
      );
    }

    if (lowerType === "appointment" || lowerTitle.includes("appoint")) {
      return (
        <div className="notification-card-icon type-appointment">
          <CalendarCheck size={20} />
        </div>
      );
    }

    if (lowerType === "health" || lowerTitle.includes("health")) {
      return (
        <div className="notification-card-icon type-health">
          <Heart size={20} />
        </div>
      );
    }

    return (
      <div className="notification-card-icon">
        <Bell size={20} />
      </div>
    );
  };

  return (
    <div className="notifications-page-layout">
      {/* SIDEBAR */}
      <DashboardSidebar activeItem="notifications" />

      {/* MAIN CONTENT */}
      <main className="notifications-main-content">
        <div className="notifications-header-bar">
          <div className="notifications-header-title">
            <span className="section-label">INBOX & ALERTS</span>
            <h1>Notifications</h1>
            <p>
              Stay updated on appointments, vaccinations, and health milestones.
            </p>
          </div>

          <div className="notifications-header-actions">
            <button
              type="button"
              className="btn-test-alert"
              onClick={handleCreateTestAlert}
              disabled={creatingTest}
              title="Generate a test unread notification for your account to test 'Mark all as read'"
            >
              <Plus size={16} />
              <span>{creatingTest ? "Adding..." : "+ Test Alert"}</span>
            </button>

            <button
              type="button"
              className="btn-mark-all"
              onClick={handleMarkAll}
              disabled={unreadCount === 0 || markingAll}
              title={unreadCount === 0 ? "All notifications are read" : "Mark all notifications as read"}
            >
              <CheckCheck size={16} />
              <span>
                {markingAll ? "Marking as read..." : "Mark all as read"}
              </span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMsg && (
          <div className="profile-error-message" style={{ marginBottom: 18 }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="profile-success-message" style={{ marginBottom: 18 }}>
            <Check size={16} />
            {successMsg}
          </div>
        )}

        {/* FILTERS */}
        <div className="notifications-filters-row">
          <button
            type="button"
            className={`notif-filter-btn ${
              activeFilter === "all" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("all")}
          >
            <span>All</span>
            <span className="notif-filter-count">{notifications.length}</span>
          </button>

          <button
            type="button"
            className={`notif-filter-btn ${
              activeFilter === "unread" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("unread")}
          >
            <span>Unread</span>
            <span className="notif-filter-count">{unreadCount}</span>
          </button>

          <button
            type="button"
            className={`notif-filter-btn ${
              activeFilter === "read" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("read")}
          >
            <span>Read</span>
            <span className="notif-filter-count">
              {notifications.length - unreadCount}
            </span>
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--muted)" }}>
            <div className="pet-spinner" style={{ margin: "0 auto 12px" }}></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty-box">
            <div className="notif-empty-icon-circle">
              <Bell size={28} />
            </div>
            <h3>You're all caught up.</h3>
            <p>
              {activeFilter === "unread"
                ? "You have no unread notifications at the moment."
                : "No notifications have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="notifications-full-list">
            {["Today", "Yesterday", "Earlier"].map((groupName) => {
              const groupItems = groupedNotifications[groupName] || [];
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName} className="notif-time-group">
                  <div className="notif-time-heading">
                    <span>{groupName}</span>
                    <span className="notif-time-count">{groupItems.length}</span>
                  </div>

                  <div className="notif-time-cards">
                    {groupItems.map((notification) => {
                      const isUnread = !notification.is_read;
                      const isUpdating = updatingId === notification.id;

                      return (
                        <div
                          key={notification.id}
                          className={`notification-full-card ${
                            isUnread ? "is-unread" : "is-read"
                          }`}
                        >
                          {getIconForType(notification.type, notification.title)}

                          <div className="notification-card-content">
                            <div className="notification-card-top">
                              <strong className="notification-card-title">
                                {notification.title}
                              </strong>

                              {isUnread && (
                                <span
                                  className="unread-badge-dot"
                                  title="Unread notification"
                                />
                              )}
                            </div>

                            <p className="notification-card-message">
                              {notification.message}
                            </p>

                            <div className="notification-card-bottom">
                              <span>
                                {formatNotificationTime(notification.created_at)}
                              </span>
                              <span>·</span>
                              <span style={{ textTransform: "capitalize" }}>
                                {notification.type || "General"}
                              </span>
                            </div>
                          </div>

                          <div className="notification-card-actions">
                            {isUnread ? (
                              <button
                                type="button"
                                className="btn-mark-single-read"
                                onClick={() => handleMarkSingle(notification.id)}
                                disabled={isUpdating}
                                title="Mark as read"
                              >
                                {isUpdating ? (
                                  <>
                                    <span className="pet-spinner"></span>
                                    <span>Updating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} />
                                    <span>Mark as read</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-mark-single-unread"
                                onClick={() => handleMarkUnread(notification.id)}
                                disabled={isUpdating}
                                title="Mark this notification as unread"
                              >
                                {isUpdating ? (
                                  <span className="pet-spinner"></span>
                                ) : (
                                  <>
                                    <RotateCcw size={13} />
                                    <span>Mark unread</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn-delete-notif"
                              onClick={() => handleDelete(notification.id)}
                              title="Delete notification"
                              aria-label="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
