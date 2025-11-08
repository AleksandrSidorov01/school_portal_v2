import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service.js';
import GradesTable from '../grades/GradesTable.jsx';
import ScheduleView from '../schedule/ScheduleView.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';
import HomeworksList from '../homeworks/HomeworksList.jsx';
import AttendancesList from '../attendances/AttendancesList.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('grades');
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentInfo();
  }, []);

  const loadStudentInfo = async () => {
    try {
      const info = await studentService.getMyInfo();
      setStudentInfo(info);
    } catch (err) {
      console.error('Ошибка загрузки информации о студенте:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'grades', name: 'Оценки', icon: '📊' },
    { id: 'homeworks', name: 'Домашние задания', icon: '📝' },
    { id: 'attendance', name: 'Посещаемость', icon: '✅' },
    { id: 'schedule', name: 'Расписание', icon: '📅' },
    { id: 'messages', name: 'Сообщения', icon: '💬' },
    { id: 'profile', name: 'Профиль', icon: '👤' },
  ];

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
                {studentInfo?.student?.class && (
                  <span className="ml-2 text-xs">
                    ({studentInfo.student.class.name})
                  </span>
                )}
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Загрузка...</div>
            </div>
          ) : (
            <>
              {activeTab === 'grades' && <GradesTable />}
              {activeTab === 'homeworks' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <Card.Title>Мои домашние задания</Card.Title>
                      <Card.Description>
                        Список всех домашних заданий
                      </Card.Description>
                    </Card.Header>
                    <Card.Content>
                      {studentInfo?.student?.id ? (
                        <HomeworksList studentId={studentInfo.student.id} showActions={true} />
                      ) : (
                        <p className="text-muted-foreground">
                          Информация о студенте не найдена. Обратитесь к администратору.
                        </p>
                      )}
                    </Card.Content>
                  </Card>
                </div>
              )}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <Card.Title>Моя посещаемость</Card.Title>
                      <Card.Description>
                        История посещаемости уроков
                      </Card.Description>
                    </Card.Header>
                    <Card.Content>
                      {studentInfo?.student?.id ? (
                        <AttendancesList studentId={studentInfo.student.id} />
                      ) : (
                        <p className="text-muted-foreground">
                          Информация о студенте не найдена. Обратитесь к администратору.
                        </p>
                      )}
                    </Card.Content>
                  </Card>
                </div>
              )}
              {activeTab === 'schedule' && <ScheduleView />}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <Card.Title>Сообщения</Card.Title>
                      <Card.Description>
                        Общение с учителями и другими пользователями
                      </Card.Description>
                    </Card.Header>
                    <Card.Content>
                      <Button onClick={() => navigate('/messages')}>
                        Открыть сообщения
                      </Button>
                    </Card.Content>
                  </Card>
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <Card.Title>Мой профиль</Card.Title>
                      <Card.Description>
                        Информация о вашем аккаунте
                      </Card.Description>
                    </Card.Header>
                    <Card.Content>
                      {studentInfo && (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Имя
                              </label>
                              <p className="text-base font-medium">
                                {studentInfo.firstName} {studentInfo.lastName}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Email
                              </label>
                              <p className="text-base font-medium">{studentInfo.email}</p>
                            </div>
                            {studentInfo.student?.class && (
                              <>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Класс
                                  </label>
                                  <p className="text-base font-medium">
                                    {studentInfo.student.class.name} ({studentInfo.student.class.grade} класс)
                                  </p>
                                </div>
                                {studentInfo.student.studentNumber && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Номер в журнале
                                    </label>
                                    <p className="text-base font-medium">
                                      {studentInfo.student.studentNumber}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </Card.Content>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
