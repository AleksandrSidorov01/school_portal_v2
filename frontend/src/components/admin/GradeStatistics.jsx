import { useState, useEffect, useMemo } from 'react';
import { gradeService } from '../../services/grade.service.js';
import { adminService } from '../../services/admin.service.js';
import Card from '../ui/Card.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import BarChart from '../charts/BarChart.jsx';
import LineChart from '../charts/LineChart.jsx';

const GradeStatistics = () => {
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [timeRange, setTimeRange] = useState('month'); // week, month, semester

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gradesData, subjectsData] = await Promise.all([
        gradeService.getAllGrades(),
        adminService.getAllSubjects(),
      ]);
      setGrades(gradesData || []);
      setSubjects(subjectsData || []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  // Статистика по предметам
  const subjectStats = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const stats = {};
    grades.forEach(grade => {
      const subjectName = grade.subject?.name || 'Не указан';
      if (!stats[subjectName]) {
        stats[subjectName] = {
          name: subjectName,
          total: 0,
          sum: 0,
          grades: [],
        };
      }
      if (grade.value) {
        stats[subjectName].total++;
        stats[subjectName].sum += grade.value;
        stats[subjectName].grades.push(grade.value);
      }
    });

    return Object.values(stats).map(stat => ({
      ...stat,
      average: stat.total > 0 ? (stat.sum / stat.total).toFixed(2) : 0,
    })).sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
  }, [grades]);

  // Статистика по оценкам (распределение)
  const gradeDistribution = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0 };
    grades.forEach(grade => {
      if (grade.value && distribution[grade.value] !== undefined) {
        distribution[grade.value]++;
      }
    });

    return [
      { name: '5 (Отлично)', value: distribution[5], color: '#10b981' },
      { name: '4 (Хорошо)', value: distribution[4], color: '#3b82f6' },
      { name: '3 (Удовлетворительно)', value: distribution[3], color: '#f59e0b' },
      { name: '2 (Неудовлетворительно)', value: distribution[2], color: '#ef4444' },
    ];
  }, [grades]);

  // Динамика успеваемости по времени
  const timeSeriesData = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const filteredGrades = grades.filter(grade => {
      if (!grade.date) return false;
      const gradeDate = new Date(grade.date);
      return gradeDate >= startDate && gradeDate <= now;
    });

    // Группировка по неделям или месяцам
    const grouped = {};
    filteredGrades.forEach(grade => {
      if (!grade.date || !grade.value) return;
      const date = new Date(grade.date);
      let key;
      
      if (timeRange === 'week') {
        key = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      } else {
        key = date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
      }

      if (!grouped[key]) {
        grouped[key] = { sum: 0, count: 0 };
      }
      grouped[key].sum += grade.value;
      grouped[key].count++;
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        average: (data.sum / data.count).toFixed(2),
        count: data.count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [grades, timeRange]);

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <TableSkeleton rows={5} columns={3} />
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card>
        <Card.Header>
          <Card.Title>Статистика успеваемости</Card.Title>
          <Card.Description>
            Анализ оценок и успеваемости
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Предмет
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Все предметы</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Период
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="semester">Полгода</option>
              </select>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Средние баллы по предметам */}
      <Card>
        <Card.Header>
          <Card.Title>Средние баллы по предметам</Card.Title>
          <Card.Description>
            Средняя успеваемость по каждому предмету
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {subjectStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <BarChart
              data={subjectStats}
              xKey="name"
              yKey="average"
              label="Средний балл"
              height={300}
            />
          )}
        </Card.Content>
      </Card>

      {/* Распределение оценок */}
      <Card>
        <Card.Header>
          <Card.Title>Распределение оценок</Card.Title>
          <Card.Description>
            Количество оценок каждого типа
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {gradeDistribution.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <div className="space-y-4">
              {gradeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm">{item.name}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 rounded"
                        style={{
                          width: `${(item.value / Math.max(...gradeDistribution.map(d => d.value))) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Динамика успеваемости */}
      <Card>
        <Card.Header>
          <Card.Title>Динамика успеваемости</Card.Title>
          <Card.Description>
            Изменение среднего балла во времени
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {timeSeriesData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <LineChart
              data={timeSeriesData}
              xKey="date"
              yKey="average"
              label="Средний балл"
              height={300}
            />
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default GradeStatistics;

