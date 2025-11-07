import { useState, useEffect, useMemo } from 'react';
import { gradeService } from '../../services/grade.service.js';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import Card from '../ui/Card.jsx';

const GradesTable = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const data = await gradeService.getMyGrades();
      setGrades(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить оценки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Получить уникальные предметы
  const subjects = useMemo(() => {
    if (!grades || grades.length === 0) return [];
    const subjectNames = grades
      .map(g => g?.subject?.name)
      .filter(Boolean);
    return [...new Set(subjectNames)];
  }, [grades]);

  // Фильтрация по предмету
  const filteredGrades = useMemo(() => {
    if (!grades || grades.length === 0) return [];
    if (selectedSubject === 'all') return grades;
    return grades.filter(g => g?.subject?.name === selectedSubject);
  }, [grades, selectedSubject]);

  // Группировка по предметам для статистики
  const subjectStats = useMemo(() => {
    if (!grades || grades.length === 0 || subjects.length === 0) return {};
    
    return subjects.reduce((acc, subjectName) => {
      const subjectGrades = grades.filter(g => g?.subject?.name === subjectName);
      const values = subjectGrades.map(g => g?.value).filter(v => v != null && !isNaN(v));
      const average = values.length > 0 
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
        : '0.00';
      
      acc[subjectName] = {
        average: parseFloat(average),
        count: values.length,
        grades: subjectGrades,
      };
      return acc;
    }, {});
  }, [grades, subjects]);

  // Общий средний балл
  const overallAverage = useMemo(() => {
    if (!grades || grades.length === 0) return '0.00';
    const values = grades.map(g => g?.value).filter(v => v != null && !isNaN(v));
    if (values.length === 0) return '0.00';
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
  }, [grades]);

  const getGradeColor = (value) => {
    if (value >= 4.5) return 'success';
    if (value >= 3.5) return 'default';
    if (value >= 2.5) return 'warning';
    return 'destructive';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка оценок...</div>
          </div>
        </Card.Content>
      </Card>
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

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Card.Header>
            <Card.Description>Общий средний балл</Card.Description>
            <Card.Title className="text-3xl">{overallAverage}</Card.Title>
          </Card.Header>
        </Card>
        <Card>
          <Card.Header>
            <Card.Description>Всего оценок</Card.Description>
            <Card.Title className="text-3xl">{grades.length}</Card.Title>
          </Card.Header>
        </Card>
        <Card>
          <Card.Header>
            <Card.Description>Предметов</Card.Description>
            <Card.Title className="text-3xl">{subjects.length}</Card.Title>
          </Card.Header>
        </Card>
        <Card>
          <Card.Header>
            <Card.Description>Отличных оценок (5)</Card.Description>
            <Card.Title className="text-3xl">
              {grades.filter(g => g?.value === 5).length}
            </Card.Title>
          </Card.Header>
        </Card>
      </div>

      {/* Фильтр по предметам */}
      {subjects.length > 0 && (
        <Card>
          <Card.Content className="pt-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedSubject === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Все предметы
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Таблица оценок */}
      <Card>
        <Card.Header>
          <Card.Title>Мои оценки</Card.Title>
          <Card.Description>
            {selectedSubject === 'all' 
              ? `Всего оценок: ${grades.length}`
              : `Оценки по предмету "${selectedSubject}": ${filteredGrades.length}`
            }
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Оценок пока нет
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Дата</Table.Head>
                  <Table.Head>Предмет</Table.Head>
                  <Table.Head>Оценка</Table.Head>
                  <Table.Head>Учитель</Table.Head>
                  <Table.Head>Комментарий</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredGrades.map((grade) => (
                  <Table.Row key={grade.id}>
                    <Table.Cell>{formatDate(grade.date)}</Table.Cell>
                    <Table.Cell className="font-medium">
                      {grade?.subject?.name || 'Не указан'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getGradeColor(grade?.value || 0)}>
                        {grade?.value || '-'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {grade?.teacher?.user 
                        ? `${grade.teacher.user.firstName} ${grade.teacher.user.lastName}`
                        : 'Не указан'
                      }
                    </Table.Cell>
                    <Table.Cell className="text-muted-foreground">
                      {grade?.comment || '-'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
      </Card>

      {/* Статистика по предметам */}
      {Object.keys(subjectStats).length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Статистика по предметам</Card.Title>
            <Card.Description>Средний балл по каждому предмету</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {Object.entries(subjectStats).map(([subjectName, stats]) => (
                <div key={subjectName} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{subjectName}</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.count} {stats.count === 1 ? 'оценка' : 'оценок'}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getGradeColor(stats.average)}>
                      {stats.average}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default GradesTable;
