import { useState, useEffect } from 'react';
import { homeworkService } from '../../services/homework.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import HomeworkDetailModal from './HomeworkDetailModal.jsx';

const HomeworksList = ({ studentId, teacherId, classId, showActions = true }) => {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadHomeworks();
  }, [studentId, teacherId, classId, user]);

  const loadHomeworks = async () => {
    try {
      const params = {};
      if (studentId) params.studentId = studentId;
      if (teacherId) params.teacherId = teacherId;
      if (classId) params.classId = classId;

      const data = await homeworkService.getAllHomeworks(params);
      setHomeworks(data);
    } catch (err) {
      console.error('Ошибка загрузки домашних заданий:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    await loadHomeworks();
    // Обновляем выбранное задание, если оно открыто
    if (selectedHomework) {
      const updated = await homeworkService.getHomeworkById(selectedHomework.id);
      setSelectedHomework(updated);
    }
  };

  const handleHomeworkClick = (homework) => {
    setSelectedHomework(homework);
    setIsDetailOpen(true);
  };

  if (loading) {
    return <div className="text-muted-foreground">Загрузка...</div>;
  }

  if (homeworks.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Нет домашних заданий</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {homeworks.map((homework) => (
          <Card
            key={homework.id}
            className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
              homework.completed
                ? 'border-green-200'
                : new Date(homework.dueDate) < new Date()
                ? 'border-red-200'
                : ''
            }`}
            onClick={() => handleHomeworkClick(homework)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{homework.title}</h3>
                  {/* Для заданий класса проверяем через completions, для индивидуальных через completed */}
                  {homework.classId ? (
                    // Для заданий класса
                    user?.role === 'STUDENT' && homework.completions?.some(c => c.student?.user?.id === user?.id) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Выполнено
                      </span>
                    ) : user?.role === 'TEACHER' && homework.completions && homework.completions.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {homework.completions.length} из {homework.class?.students?.length || 0} выполнили
                      </span>
                    ) : null
                  ) : (
                    // Для индивидуальных заданий
                    homework.completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Выполнено
                      </span>
                    )
                  )}
                  {/* Просрочено - для заданий класса проверяем через completions, для индивидуальных через completed */}
                  {homework.classId ? (
                    !homework.completions?.some(c => c.student?.user?.id === user?.id) && new Date(homework.dueDate) < new Date() && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Просрочено
                      </span>
                    )
                  ) : (
                    !homework.completed && new Date(homework.dueDate) < new Date() && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Просрочено
                      </span>
                    )
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{homework.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Предмет: {homework.subject.name}</span>
                  {homework.class ? (
                    <span>Класс: {homework.class.name} *</span>
                  ) : homework.student ? (
                    <span>
                      Ученик: {homework.student.user.firstName} {homework.student.user.lastName}
                    </span>
                  ) : null}
                  <span>
                    Дедлайн: {new Date(homework.dueDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <HomeworkDetailModal
        homework={selectedHomework}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedHomework(null);
        }}
        onMarkCompleted={handleMarkCompleted}
        showActions={showActions}
      />
    </>
  );
};

export default HomeworksList;

