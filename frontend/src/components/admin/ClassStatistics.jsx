import { useState, useEffect, useMemo } from 'react';
import { classService } from '../../services/class.service.js';
import { gradeService } from '../../services/grade.service.js';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import BarChart from '../charts/BarChart.jsx';

const ClassStatistics = () => {
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, gradesData] = await Promise.all([
        classService.getAllClasses(),
        gradeService.getAllGrades(),
      ]);
      setClasses(classesData || []);
      setGrades(gradesData || []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  // Статистика по классам
  const classStats = useMemo(() => {
    if (!classes || !grades || classes.length === 0) return [];

    return classes.map(cls => {
      const classStudents = cls.students || [];
      const studentIds = classStudents.map(s => s.id);
      
      const classGrades = grades.filter(grade => 
        studentIds.includes(grade.studentId)
      );

      const gradeValues = classGrades
        .map(g => g.value)
        .filter(v => v !== null && v !== undefined);

      const total = gradeValues.length;
      const sum = gradeValues.reduce((acc, val) => acc + val, 0);
      const average = total > 0 ? (sum / total).toFixed(2) : 0;

      // Распределение оценок
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0 };
      gradeValues.forEach(val => {
        if (distribution[val] !== undefined) {
          distribution[val]++;
        }
      });

      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        studentsCount: classStudents.length,
        gradesCount: total,
        average: parseFloat(average),
        distribution,
        excellent: distribution[5],
        good: distribution[4],
        satisfactory: distribution[3],
        unsatisfactory: distribution[2],
      };
    }).sort((a, b) => {
      // Сначала по номеру класса, потом по букве
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.name.localeCompare(b.name);
    });
  }, [classes, grades]);

  // Топ классов по успеваемости
  const topClasses = useMemo(() => {
    return [...classStats]
      .filter(stat => stat.gradesCount > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [classStats]);

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <TableSkeleton rows={5} columns={5} />
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <Card>
        <Card.Header>
          <Card.Title>Статистика по классам</Card.Title>
          <Card.Description>
            Сравнение успеваемости классов
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {classStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <BarChart
              data={classStats.filter(s => s.gradesCount > 0)}
              xKey="name"
              yKey="average"
              label="Средний балл"
              height={300}
            />
          )}
        </Card.Content>
      </Card>

      {/* Топ классов */}
      <Card>
        <Card.Header>
          <Card.Title>Топ-5 классов по успеваемости</Card.Title>
          <Card.Description>
            Классы с наилучшей успеваемостью
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {topClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <div className="space-y-4">
              {topClasses.map((stat, index) => (
                <div key={stat.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{stat.name} ({stat.grade} класс)</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.studentsCount} учеников • {stat.gradesCount} оценок
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.average}</div>
                      <div className="text-xs text-muted-foreground">средний балл</div>
                    </div>
                    <Badge variant={stat.average >= 4.5 ? 'default' : stat.average >= 3.5 ? 'secondary' : 'outline'}>
                      {stat.average >= 4.5 ? 'Отлично' : stat.average >= 3.5 ? 'Хорошо' : 'Удовлетворительно'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Детальная статистика по классам */}
      <Card>
        <Card.Header>
          <Card.Title>Детальная статистика по классам</Card.Title>
          <Card.Description>
            Подробная информация по каждому классу
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {classStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <div className="space-y-4">
              {classStats.map(stat => (
                <div key={stat.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{stat.name} ({stat.grade} класс)</h3>
                      <div className="text-sm text-muted-foreground">
                        {stat.studentsCount} учеников
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.average || '-'}</div>
                      <div className="text-xs text-muted-foreground">средний балл</div>
                    </div>
                  </div>
                  
                  {stat.gradesCount > 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{stat.excellent}</div>
                        <div className="text-xs text-muted-foreground">Отлично (5)</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{stat.good}</div>
                        <div className="text-xs text-muted-foreground">Хорошо (4)</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{stat.satisfactory}</div>
                        <div className="text-xs text-muted-foreground">Удовл. (3)</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">{stat.unsatisfactory}</div>
                        <div className="text-xs text-muted-foreground">Неуд. (2)</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Нет оценок
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default ClassStatistics;

