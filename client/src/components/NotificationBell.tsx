import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const backend = import.meta.env.VITE_BACKEND;

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    const response = await fetch(`${backend}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Delete notification and update UI/backend
  const handleReadNotification = async (notificationId: string) => {
    await fetch(`${backend}/api/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchNotifications();
  };

  // Clear all notifications
  const handleReadAll = async () => {
    await fetch(`${backend}/api/notifications/clear-all`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchNotifications();
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="flex items-center justify-between p-2 font-bold border-b">
            <span>Notifications</span>
            <button
              className="text-xs text-blue-600 underline"
              onClick={handleReadAll}
              disabled={notifications.length === 0}
            >
              Read All
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-2 text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-2 border-b flex items-center justify-between cursor-pointer`}
                onClick={() => handleReadNotification(n._id)}
              >
                <div>
                  <div>{n.content}</div>
                  <a href={n.link} className="text-xs text-blue-600 underline">
                    View
                  </a>
                </div>
                {/* Dot only for unread, but notification will be removed after click */}
                {!n.read && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
