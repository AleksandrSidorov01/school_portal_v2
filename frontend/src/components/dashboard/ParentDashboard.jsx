import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { parentService } from '../../services/parent.service.js';
import NotificationBell from '../notifications/NotificationBell.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('children');
  const [parentInfo, setParentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentInfo();
  }, []);

  const loadParentInfo = async () => {
    try {
      const info = await parentService.getMyInfo();
      setParentInfo(info);
    } catch (err) {
      console.error('Ошибка загрузки информации о родителе:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'children', name: 'Мои дети', icon: '👨‍👩‍👧‍👦' },
    { id: 'grades', name: 'Оценки', icon: '📊' },
    { id: 'attendance', name: 'Посещаемость', icon: '✅' },
    { id: 'homeworks', name: 'Домашние задания', icon: '📝' },
    { id: 'messages', name: 'Сообщения', icon: '💬' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

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
                <span className="ml-2 text-xs">(Родитель)</span>
              </div>
              <NotificationBell />
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Табы навигации */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'children' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Мои дети</h2>
            {parentInfo?.students && parentInfo.students.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {parentInfo.students.map((student) => (
                  <Card key={student.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {student.user.firstName} {student.user.lastName}
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Класс:</span> {student.class.name}
                      </p>
                      {student.studentNumber && (
                        <p>
                          <span className="font-medium">Номер в журнале:</span> {student.studentNumber}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">У вас пока нет привязанных детей</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Оценки детей</h2>
            {parentInfo?.students && parentInfo.students.length > 0 ? (
              <div className="space-y-6">
                {parentInfo.students.map((student) => (
                  <Card key={student.id} className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {student.user.firstName} {student.user.lastName} ({student.class.name})
                    </h3>
                    {student.grades && student.grades.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Предмет</th>
                              <th className="text-left p-2">Оценка</th>
                              <th className="text-left p-2">Учитель</th>
                              <th className="text-left p-2">Дата</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.grades.map((grade) => (
                              <tr key={grade.id} className="border-b">
                                <td className="p-2">{grade.subject.name}</td>
                                <td className="p-2">
                                  <span className="font-semibold">{grade.value}</span>
                                </td>
                                <td className="p-2">
                                  {grade.teacher.user.firstName} {grade.teacher.user.lastName}
                                </td>
                                <td className="p-2">
                                  {new Date(grade.date).toLocaleDateString('ru-RU')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Нет оценок</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">У вас пока нет привязанных детей</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Посещаемость детей</h2>
            {parentInfo?.students && parentInfo.students.length > 0 ? (
              <div className="space-y-6">
                {parentInfo.students.map((student) => (
                  <Card key={student.id} className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {student.user.firstName} {student.user.lastName} ({student.class.name})
                    </h3>
                    {student.attendances && student.attendances.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Дата</th>
                              <th className="text-left p-2">Предмет</th>
                              <th className="text-left p-2">Статус</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.attendances.map((attendance) => (
                              <tr key={attendance.id} className="border-b">
                                <td className="p-2">
                                  {new Date(attendance.date).toLocaleDateString('ru-RU')}
                                </td>
                                <td className="p-2">{attendance.schedule.subject.name}</td>
                                <td className="p-2">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      attendance.status === 'present'
                                        ? 'bg-green-100 text-green-800'
                                        : attendance.status === 'absent'
                                        ? 'bg-red-100 text-red-800'
                                        : attendance.status === 'late'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {attendance.status === 'present'
                                      ? 'Присутствовал'
                                      : attendance.status === 'absent'
                                      ? 'Отсутствовал'
                                      : attendance.status === 'late'
                                      ? 'Опоздал'
                                      : 'Уважительная причина'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Нет записей о посещаемости</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">У вас пока нет привязанных детей</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'homeworks' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Домашние задания детей</h2>
            {parentInfo?.students && parentInfo.students.length > 0 ? (
              <div className="space-y-6">
                {parentInfo.students.map((student) => (
                  <Card key={student.id} className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {student.user.firstName} {student.user.lastName} ({student.class.name})
                    </h3>
                    {student.homeworks && student.homeworks.length > 0 ? (
                      <div className="space-y-4">
                        {student.homeworks.map((homework) => (
                          <div
                            key={homework.id}
                            className={`p-4 rounded-lg border ${
                              homework.completed
                                ? 'bg-green-50 border-green-200'
                                : new Date(homework.dueDate) < new Date()
                                ? 'bg-red-50 border-red-200'
                                : 'bg-card border-border'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{homework.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {homework.description}
                                </p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <span>Предмет: {homework.subject.name}</span>
                                  <span className="ml-4">
                                    Дедлайн: {new Date(homework.dueDate).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                {homework.completed ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    Выполнено
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                    В работе
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Нет домашних заданий</p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">У вас пока нет привязанных детей</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Сообщения</h2>
              <p className="text-muted-foreground mb-4">
                Общение с учителями и администрацией школы
              </p>
              <Button onClick={() => navigate('/messages')}>
                Открыть сообщения
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;

