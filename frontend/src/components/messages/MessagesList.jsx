import { useState, useEffect } from 'react';
import { messageService } from '../../services/message.service.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const MessagesList = ({ userId, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Ошибка загрузки диалогов:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Загрузка...</div>;
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Нет сообщений</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.userId}
          className={`p-4 cursor-pointer hover:bg-accent ${
            conversation.unreadCount > 0 ? 'border-primary' : ''
          }`}
          onClick={() => onSelectConversation?.(conversation.userId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {conversation.user.firstName} {conversation.user.lastName}
                </h3>
                <span className="text-xs text-muted-foreground">({conversation.user.role})</span>
                {conversation.unreadCount > 0 && (
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              {conversation.lastMessage && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {conversation.lastMessage.content}
                </p>
              )}
              {conversation.lastMessage && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(conversation.lastMessage.createdAt).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MessagesList;

