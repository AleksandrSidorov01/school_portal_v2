import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/teacher.service.js';
import CreateGradeForm from '../grades/CreateGradeForm.jsx';
import ClassesList from '../classes/ClassesList.jsx';
import TeacherScheduleView from '../schedule/TeacherScheduleView.jsx';
import HomeworksList from '../homeworks/HomeworksList.jsx';
import CreateHomeworkModal from '../homeworks/CreateHomeworkModal.jsx';
import AttendancesList from '../attendances/AttendancesList.jsx';
import CreateAttendanceModal from '../attendances/CreateAttendanceModal.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('grades');
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateHomeworkModal, setShowCreateHomeworkModal] = useState(false);
  const [showCreateAttendanceModal, setShowCreateAttendanceModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [homeworksKey, setHomeworksKey] = useState(0);
  const [attendancesKey, setAttendancesKey] = useState(0);

  useEffect(() => {
    loadTeacherInfo();
  }, []);

  const loadTeacherInfo = async () => {
    try {
      const info = await teacherService.getMyInfo();
      setTeacherInfo(info);
    } catch (err) {
      console.error('Ошибка загрузки информации о учителе:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'grades', name: 'Выставление оценок', icon: '📝' },
    { id: 'homeworks', name: 'Домашние задания', icon: '📚' },
    { id: 'attendance', name: 'Посещаемость', icon: '✅' },
    { id: 'classes', name: 'Мои классы', icon: '👥' },
    { id: 'schedule', name: 'Расписание', icon: '📅' },
    { id: 'messages', name: 'Сообщения', icon: '💬' },
    { id: 'profile', name: 'Профиль', icon: '👤' },
  ];

  const handleGradeSuccess = () => {
    // Можно добавить обновление списка оценок или уведомление
    console.log('Оценка успешно выставлена');
  };

  const handleHomeworkSuccess = () => {
    setShowCreateHomeworkModal(false);
    setHomeworksKey(prev => prev + 1); // Обновить список домашних заданий
  };

  const handleAttendanceSuccess = () => {
    setShowCreateAttendanceModal(false);
    setAttendancesKey(prev => prev + 1); // Обновить список посещаемости
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
                {teacherInfo?.teacher?.specialization && (
                  <span className="ml-2 text-xs">
                    ({teacherInfo.teacher.specialization})
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
              {activeTab === 'grades' && (
                <CreateGradeForm onSuccess={handleGradeSuccess} />
              )}
              {activeTab === 'homeworks' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <div className="flex items-center justify-between">
                        <div>
                          <Card.Title>Домашние задания</Card.Title>
                          <Card.Description>
                            Управление домашними заданиями для ваших классов
                          </Card.Description>
                        </div>
                        <Button onClick={() => setShowCreateHomeworkModal(true)}>
                          Создать задание
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <HomeworksList 
                        key={homeworksKey}
                        teacherId={teacherInfo?.teacher?.id} 
                        showActions={false}
                      />
                    </Card.Content>
                  </Card>
                  <CreateHomeworkModal
                    isOpen={showCreateHomeworkModal}
                    onClose={() => setShowCreateHomeworkModal(false)}
                    onSuccess={handleHomeworkSuccess}
                    teacherId={teacherInfo?.teacher?.id}
                  />
                </div>
              )}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <div className="flex items-center justify-between">
                        <div>
                          <Card.Title>Посещаемость</Card.Title>
                          <Card.Description>
                            Учет посещаемости учеников
                          </Card.Description>
                        </div>
                        <Button onClick={() => setShowCreateAttendanceModal(true)}>
                          Отметить посещаемость
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <AttendancesList 
                        key={attendancesKey}
                        teacherId={teacherInfo?.teacher?.id} 
                      />
                    </Card.Content>
                  </Card>
                  <CreateAttendanceModal
                    isOpen={showCreateAttendanceModal}
                    onClose={() => setShowCreateAttendanceModal(false)}
                    onSuccess={handleAttendanceSuccess}
                  />
                </div>
              )}
              {activeTab === 'classes' && <ClassesList />}
              {activeTab === 'schedule' && <TeacherScheduleView />}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <Card>
                    <Card.Header>
                      <Card.Title>Сообщения</Card.Title>
                      <Card.Description>
                        Общение с учениками и другими учителями
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
                      {teacherInfo && (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Имя
                              </label>
                              <p className="text-base font-medium">
                                {teacherInfo.firstName} {teacherInfo.lastName}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Email
                              </label>
                              <p className="text-base font-medium">{teacherInfo.email}</p>
                            </div>
                            {teacherInfo.teacher && (
                              <>
                                {teacherInfo.teacher.specialization && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Специализация
                                    </label>
                                    <p className="text-base font-medium">
                                      {teacherInfo.teacher.specialization}
                                    </p>
                                  </div>
                                )}
                                {teacherInfo.teacher.subjects && teacherInfo.teacher.subjects.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Предметы
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {teacherInfo.teacher.subjects.map((subject) => (
                                        <span
                                          key={subject.id}
                                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground"
                                        >
                                          {subject.name}
                                        </span>
                                      ))}
                                    </div>
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

export default TeacherDashboard;
