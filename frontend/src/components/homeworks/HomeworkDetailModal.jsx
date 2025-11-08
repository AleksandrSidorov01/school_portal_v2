import { useState, useEffect } from 'react';
import { homeworkService } from '../../services/homework.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

const HomeworkDetailModal = ({ homework, isOpen, onClose, onMarkCompleted, showActions = true }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [completionStats, setCompletionStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (homework?.attachments) {
      try {
        const parsed = JSON.parse(homework.attachments);
        setAttachments(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setAttachments([]);
      }
    } else {
      setAttachments([]);
    }

    // Загружаем статистику выполнения для учителя, если задание для класса
    if (homework?.classId && user?.role === 'TEACHER' && isOpen) {
      loadCompletionStats();
    }
  }, [homework, isOpen, user]);

  const loadCompletionStats = async () => {
    if (!homework?.id) return;
    
    setLoadingStats(true);
    try {
      const stats = await homeworkService.getCompletionStats(homework.id);
      setCompletionStats(stats);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!homework || homework.completed) return;
    
    setLoading(true);
    try {
      await homeworkService.markAsCompleted(homework.id);
      onMarkCompleted?.();
      onClose();
    } catch (err) {
      console.error('Ошибка отметки задания:', err);
      alert(err.response?.data?.message || 'Ошибка отметки задания');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !homework) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">{homework.title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Статус */}
          <div className="flex items-center gap-2">
            {homework.completed ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Выполнено
              </span>
            ) : new Date(homework.dueDate) < new Date() ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Просрочено
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                В работе
              </span>
            )}
          </div>

          {/* Информация */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Предмет:</span>
              <span className="ml-2 font-medium">{homework.subject.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Учитель:</span>
              <span className="ml-2 font-medium">
                {homework.teacher.user.firstName} {homework.teacher.user.lastName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Дедлайн:</span>
              <span className="ml-2 font-medium">
                {new Date(homework.dueDate).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {homework.class ? (
              <div>
                <span className="text-muted-foreground">Для класса:</span>
                <span className="ml-2 font-medium">{homework.class.name}</span>
              </div>
            ) : homework.student ? (
              <div>
                <span className="text-muted-foreground">Для ученика:</span>
                <span className="ml-2 font-medium">
                  {homework.student.user.firstName} {homework.student.user.lastName}
                </span>
              </div>
            ) : null}
            {homework.completed && homework.completedAt && (
              <div>
                <span className="text-muted-foreground">Выполнено:</span>
                <span className="ml-2 font-medium">
                  {new Date(homework.completedAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          {/* Описание */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Описание задания:</h3>
            <p className="text-foreground whitespace-pre-wrap">{homework.description}</p>
          </Card>

          {/* Прикрепленные файлы */}
          {attachments.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Прикрепленные файлы:</h3>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded border hover:bg-accent text-sm"
                  >
                    <span>📎</span>
                    <span className="flex-1 truncate">{attachment}</span>
                    <span className="text-xs text-muted-foreground">Открыть</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Список класса с отметками выполнения (для учителя) */}
          {homework.classId && user?.role === 'TEACHER' && (
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">
                Выполнение задания классом {homework.class?.name}
              </h3>
              {loadingStats ? (
                <p className="text-muted-foreground">Загрузка...</p>
              ) : completionStats ? (
                <div className="space-y-2">
                  {completionStats.students.map((item, index) => (
                    <div
                      key={item.student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium text-foreground">
                        {item.student.firstName} {item.student.lastName}
                      </span>
                      {item.completed ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Выполнено
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.completedAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Не выполнено
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Нет данных</p>
              )}
            </Card>
          )}

          {/* Кнопки действий */}
          {showActions && !homework.completed && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
              <Button onClick={handleMarkCompleted} disabled={loading}>
                {loading ? 'Отмечается...' : 'Отметить как выполненное'}
              </Button>
            </div>
          )}

          {(!showActions || homework.completed) && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkDetailModal;

