import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notification.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import Badge from '../ui/Badge.jsx';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadUnreadCount();
    loadNotifications();
    
    // Обновляем каждые 30 секунд
    const interval = setInterval(() => {
      loadUnreadCount();
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Ошибка загрузки количества уведомлений:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Ошибка загрузки уведомлений:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadUnreadCount();
      await loadNotifications();
    } catch (err) {
      showToast('Ошибка при обновлении уведомления', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      await loadUnreadCount();
      await loadNotifications();
      showToast('Все уведомления отмечены как прочитанные', 'success');
    } catch (err) {
      showToast('Ошибка при обновлении уведомлений', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadUnreadCount();
      await loadNotifications();
    } catch (err) {
      showToast('Ошибка при удалении уведомления', 'error');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Только что';
      if (minutes < 60) return `${minutes} мин. назад`;
      if (hours < 24) return `${hours} ч. назад`;
      if (days < 7) return `${days} дн. назад`;
      return date.toLocaleDateString('ru-RU');
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'grade_added':
      case 'grade_updated':
        return '📊';
      case 'profile_created':
        return '👤';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-card border rounded-md shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Уведомления</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Отметить все как прочитанные
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Нет уведомлений
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-accent transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {notification.title}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {formatDate(notification.createdAt)}
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-primary hover:text-primary/80"
                              >
                                Отметить как прочитанное
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-xs text-destructive hover:text-destructive/80"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

