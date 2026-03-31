"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const MODULE_COLORS = {
  VENDOR: 'bg-blue-100 text-blue-700',
  VENDOR_DOCUMENT: 'bg-orange-100 text-orange-700',
  PURCHASE_ORDER: 'bg-green-100 text-green-700',
  SUBMISSION: 'bg-purple-100 text-purple-700',
  IPC: 'bg-yellow-100 text-yellow-700',
  TASK: 'bg-red-100 text-red-700',
};

const MODULE_LABELS = {
  VENDOR: 'Vendor', VENDOR_DOCUMENT: 'Document', PURCHASE_ORDER: 'PO',
  SUBMISSION: 'RFQ', IPC: 'IPC', TASK: 'Task',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function groupByDate(items) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  return {
    'Today': items.filter(n => new Date(n.createdAt) >= today),
    'Yesterday': items.filter(n => new Date(n.createdAt) >= yesterday && new Date(n.createdAt) < today),
    'This Week': items.filter(n => new Date(n.createdAt) >= weekAgo && new Date(n.createdAt) < yesterday),
    'Earlier': items.filter(n => new Date(n.createdAt) < weekAgo),
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [marking, setMarking] = useState(false);
  const LIMIT = 20;

  const fetchNotifications = useCallback(async (reset = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) { router.replace('/login'); return; }
    const currentOffset = reset ? 0 : offset;
    try {
      const params = new URLSearchParams({ limit: LIMIT, offset: currentOffset });
      if (filter === 'UNREAD') params.set('unreadOnly', 'true');
      const res = await fetch(`${API_URL}/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { router.replace('/login'); return; }
      const data = await res.json();
      const items = data.data || [];
      if (reset) {
        setNotifications(items);
        setOffset(LIMIT);
      } else {
        setNotifications(prev => [...prev, ...items]);
        setOffset(prev => prev + LIMIT);
      }
      setHasMore(items.length === LIMIT);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, offset, router]);

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchNotifications(true);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAllRead = async () => {
    const token = localStorage.getItem('authToken');
    setMarking(true);
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } finally {
      setMarking(false);
    }
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_URL}/api/notifications/${notif.id}/read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    if (notif.actionUrl) window.location.href = notif.actionUrl;
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    await fetch(`${API_URL}/api/notifications/${notifId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const filtered = filter === 'URGENT'
    ? notifications.filter(n => n.priority === 'HIGH')
    : notifications;

  const groups = groupByDate(filtered);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ResponsiveLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">{t('notifications')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('stayUpdatedActivity')}</p>
          </div>
          <button
            onClick={markAllRead}
            disabled={marking || unreadCount === 0}
            className="px-4 py-2 text-sm bg-[#0A1628] text-white rounded-lg hover:bg-[#0d1f3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {marking ? t('marking') : t('markAllAsRead')}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {['ALL', 'UNREAD', 'URGENT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-white text-[#0A1628] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'ALL' ? t('all', 'All') : f === 'UNREAD' ? `${t('unread')}${unreadCount > 0 ? ` (${unreadCount})` : ''}` : t('URGENT')}
            </button>
          ))}
        </div>

        {/* Notification groups */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">{t('loadingNotifications')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500 font-medium text-lg">{t('allCaughtUp')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('noNotificationsYet')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).filter(([, items]) => items.length > 0).map(([label, items]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t(label.toLowerCase().replace(' ', ''), label)}</p>
                <div className="space-y-2">
                  {items.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => handleClick(notif)}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors group ${
                        notif.read ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                      } ${notif.priority === 'HIGH' ? 'border-l-4 border-l-red-400' : ''}`}
                    >
                      {/* Unread dot */}
                      <div className="mt-1 flex-shrink-0">
                        {!notif.read
                          ? <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#B8960A' }} />
                          : <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-[#0A1628]'}`}>
                            {notif.title}
                          </span>
                          {notif.module && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODULE_COLORS[notif.module] || 'bg-gray-100 text-gray-600'}`}>
                              {MODULE_LABELS[notif.module] || notif.module}
                            </span>
                          )}
                          {notif.priority === 'HIGH' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Urgent</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{notif.body}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notif.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity text-lg leading-none flex-shrink-0"
                        title="Delete"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="text-center pt-2">
                <button
                  onClick={() => fetchNotifications(false)}
                  className="px-6 py-2 text-sm text-[#0A1628] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('loadMore')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
