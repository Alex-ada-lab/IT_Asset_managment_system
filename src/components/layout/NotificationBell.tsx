'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { notifications as notificationsApi } from '@/lib/api';
import type { Notification } from '@/types';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const resp = await notificationsApi.list({ limit: 10 });
      const data = resp.data;
      const list: Notification[] = Array.isArray(data)
        ? data
        : (data.data ?? []);
      setItems(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch {
      // silently fail
    }
  }, []);

  // Initial fetch + 60-second polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">
                No notifications
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={[
                    'px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 transition-colors',
                    !n.isRead ? 'bg-blue-50' : '',
                  ].join(' ')}
                >
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-slate-600 text-xs">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
