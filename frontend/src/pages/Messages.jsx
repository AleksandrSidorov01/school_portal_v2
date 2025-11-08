import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { messageService } from '../services/message.service.js';
import MessagesList from '../components/messages/MessagesList.jsx';
import ConversationView from '../components/messages/ConversationView.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import NotificationBell from '../components/notifications/NotificationBell.jsx';

const Messages = () => {
  const { user, logout } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Ошибка загрузки количества непрочитанных сообщений:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Навигация */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">Школьный портал</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </div>
              <NotificationBell />
              <Button
                onClick={logout}
                variant="destructive"
              >
                Выход
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Сообщения</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              У вас {unreadCount} непрочитанных сообщений
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список диалогов */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Диалоги</h3>
              <MessagesList
                userId={user?.id}
                onSelectConversation={(userId) => setSelectedUserId(userId)}
              />
            </Card>
          </div>

          {/* Область диалога */}
          <div className="lg:col-span-2">
            <Card className="p-4 min-h-[500px]">
              {selectedUserId ? (
                <ConversationView
                  userId={selectedUserId}
                  onBack={() => setSelectedUserId(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Выберите диалог для просмотра сообщений
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;

