import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Use mock data if API fails
            setNotifications([
                {
                    id: 1,
                    message: 'Your booking for tomorrow at 2 PM is confirmed',
                    read: false,
                    created_at: new Date().toISOString(),
                    type: 'booking'
                },
                {
                    id: 2,
                    message: 'Your vehicle has been taken for servicing',
                    read: false,
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    type: 'service'
                },
                {
                    id: 3,
                    message: 'Brake fluid replaced successfully',
                    read: true,
                    created_at: new Date(Date.now() - 7200000).toISOString(),
                    type: 'service'
                },
                {
                    id: 4,
                    message: 'Your vehicle is ready for pickup',
                    read: true,
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    type: 'pickup'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'booking': '📅',
            'service': '🔧',
            'pickup': '✅',
            'reminder': '⏰',
            'alert': '⚠️'
        };
        return icons[type] || '📬';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.read);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Layout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
                    <p className="text-gray-500">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-purple-50 rounded-lg transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'unread', 'read'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-purple-50'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === 'unread' && unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-white text-primary rounded-full text-xs">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                        <p className="text-gray-500">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white p-5 rounded-xl shadow-sm border transition-all hover:shadow-md ${notification.read ? 'border-gray-100' : 'border-primary/30 bg-purple-50/30'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start flex-1">
                                    <div className="text-3xl mr-4">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs text-primary hover:text-purple-700 font-medium"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-xl text-center border border-dashed border-gray-300">
                        <div className="text-5xl mb-4">🔔</div>
                        <p className="text-gray-500 mb-2">No notifications</p>
                        <p className="text-sm text-gray-400">You're all caught up!</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Notifications;
