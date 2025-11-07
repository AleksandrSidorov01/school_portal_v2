import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import StatisticsCards from '../admin/StatisticsCards.jsx';
import UsersManagement from '../admin/UsersManagement.jsx';
import ClassesManagement from '../admin/ClassesManagement.jsx';
import SubjectsManagement from '../admin/SubjectsManagement.jsx';
import ScheduleManagement from '../schedule/ScheduleManagement.jsx';
import GradeStatistics from '../admin/GradeStatistics.jsx';
import ClassStatistics from '../admin/ClassStatistics.jsx';
import Reports from '../admin/Reports.jsx';
import Card from '../ui/Card.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('statistics');

  const tabs = [
    { id: 'statistics', name: 'Статистика', icon: '📊' },
    { id: 'grade-stats', name: 'Успеваемость', icon: '📈' },
    { id: 'class-stats', name: 'Классы', icon: '🏫' },
    { id: 'reports', name: 'Отчеты', icon: '📄' },
    { id: 'users', name: 'Пользователи', icon: '👥' },
    { id: 'classes', name: 'Управление классами', icon: '🏛️' },
    { id: 'subjects', name: 'Предметы', icon: '📚' },
    { id: 'schedule', name: 'Расписание', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Навигация */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">Школьный портал - Админ панель</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName} (Администратор)
              </div>
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
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <Card.Title>Статистика системы</Card.Title>
                  <Card.Description>
                    Общая информация о системе
                  </Card.Description>
                </Card.Header>
              </Card>
              <StatisticsCards />
            </div>
          )}
          {activeTab === 'grade-stats' && <GradeStatistics />}
          {activeTab === 'class-stats' && <ClassStatistics />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'classes' && <ClassesManagement />}
          {activeTab === 'subjects' && <SubjectsManagement />}
          {activeTab === 'schedule' && <ScheduleManagement />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
