"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  _id: string;
  type: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

const NOTIFICATION_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION as string;

function timeLabel(value?: string) {
  if (!value) return "Recently";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch(NOTIFICATION_URL, {
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setNotifications(data.slice(0, 8));
      }
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  async function openNotification(notification: Notification) {
    if (!notification.isRead) {
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item,
        ),
      );

      await fetch(NOTIFICATION_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification._id }),
      });
    }

    setOpen(false);
    router.push(notification.link);
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((value) => !value);
          loadNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-3 top-16 z-50 flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-container-low shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:h-96 sm:w-80 sm:max-h-none">
            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-on-surface">Notifications</p>
              <p className="text-[11px] text-on-surface-variant">
                {unreadCount} unread
              </p>
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-on-surface-variant">
                No notifications yet.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => openNotification(notification)}
                    className="flex w-full gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.isRead ? "bg-outline-variant" : "bg-primary"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 break-words text-sm text-on-surface">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-on-surface-variant">
                        {timeLabel(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
