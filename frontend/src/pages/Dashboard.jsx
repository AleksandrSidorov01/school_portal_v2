import { useAuth } from '../context/AuthContext.jsx';
import StudentDashboard from '../components/dashboard/StudentDashboard.jsx';
import TeacherDashboard from '../components/dashboard/TeacherDashboard.jsx';
import AdminDashboard from '../components/dashboard/AdminDashboard.jsx';
import ParentDashboard from '../components/dashboard/ParentDashboard.jsx';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Загрузка...</div>;
  }

  // Рендерим соответствующую панель в зависимости от роли
  switch (user.role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    default:
      return <div>Неизвестная роль</div>;
  }
};

export default Dashboard;

