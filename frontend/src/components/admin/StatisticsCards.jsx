import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import Card from '../ui/Card.jsx';

const StatisticsCards = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStatistics();
      setStatistics(data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить статистику');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <Card.Header>
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-muted rounded w-16 mt-2 animate-pulse"></div>
            </Card.Header>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Content>
          <div className="text-destructive">{error}</div>
        </Card.Content>
      </Card>
    );
  }

  const stats = [
    {
      title: 'Всего пользователей',
      value: statistics?.totalUsers || 0,
      icon: '👥',
      color: 'text-blue-600',
    },
    {
      title: 'Учеников',
      value: statistics?.totalStudents || 0,
      icon: '🎓',
      color: 'text-green-600',
    },
    {
      title: 'Учителей',
      value: statistics?.totalTeachers || 0,
      icon: '👨‍🏫',
      color: 'text-purple-600',
    },
    {
      title: 'Классов',
      value: statistics?.totalClasses || 0,
      icon: '🏫',
      color: 'text-orange-600',
    },
    {
      title: 'Оценок',
      value: statistics?.totalGrades || 0,
      icon: '📊',
      color: 'text-red-600',
    },
    {
      title: 'Предметов',
      value: statistics?.totalSubjects || 0,
      icon: '📚',
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <Card.Header>
            <Card.Description>{stat.title}</Card.Description>
            <div className="flex items-center justify-between mt-2">
              <Card.Title className="text-3xl">{stat.value}</Card.Title>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </Card.Header>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsCards;

