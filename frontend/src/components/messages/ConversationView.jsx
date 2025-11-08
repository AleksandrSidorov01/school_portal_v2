import { useState, useEffect, useRef } from 'react';
import { messageService } from '../../services/message.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const ConversationView = ({ userId, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      loadMessages();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const data = await messageService.getConversation(userId);
      setMessages(data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await messageService.createMessage({
        receiverId: userId,
        content: newMessage,
      });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      alert(err.response?.data?.message || 'Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {onBack && (
        <div className="mb-4">
          <Button variant="outline" onClick={onBack}>
            ← Назад
          </Button>
        </div>
      )}
      <Card className="flex-1 flex flex-col p-4 min-h-[400px]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => {
            const isOwn = message.senderId === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.subject && (
                    <div className="font-semibold mb-1">{message.subject}</div>
                  )}
                  <div>{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleString('ru-RU')}
                    {message.read && isOwn && ' ✓'}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? 'Отправка...' : 'Отправить'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ConversationView;

