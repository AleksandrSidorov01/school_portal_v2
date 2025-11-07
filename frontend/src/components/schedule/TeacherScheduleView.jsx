import { useState, useEffect, useMemo } from 'react';
import { scheduleService } from '../../services/schedule.service.js';
import { teacherService } from '../../services/teacher.service.js';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';

const TeacherScheduleView = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const daysOfWeek = [
    { number: 1, name: 'Понедельник', short: 'Пн' },
    { number: 2, name: 'Вторник', short: 'Вт' },
    { number: 3, name: 'Среда', short: 'Ср' },
    { number: 4, name: 'Четверг', short: 'Чт' },
    { number: 5, name: 'Пятница', short: 'Пт' },
    { number: 6, name: 'Суббота', short: 'Сб' },
    { number: 7, name: 'Воскресенье', short: 'Вс' },
  ];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      // Получаем расписание учителя через фильтр по teacherId
      const teacherInfo = await teacherService.getMyInfo();
      if (teacherInfo.teacher && teacherInfo.teacher.id) {
        const data = await scheduleService.getAllSchedules({
          teacherId: teacherInfo.teacher.id,
        });
        setSchedule(data || []);
      } else {
        setSchedule([]);
      }
      setError('');
    } catch (err) {
      setError('Не удалось загрузить расписание');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Группировка расписания по дням недели
  const scheduleByDay = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return daysOfWeek.map(day => ({ ...day, lessons: [] }));
    }
    
    return daysOfWeek.map(day => ({
      ...day,
      lessons: schedule
        .filter(s => s?.dayOfWeek === day.number)
        .sort((a, b) => (a?.lessonNumber || 0) - (b?.lessonNumber || 0)),
    }));
  }, [schedule]);

  // Время уроков
  const getLessonTime = (lessonNumber) => {
    const times = {
      1: '08:00 - 08:45',
      2: '08:55 - 09:40',
      3: '09:50 - 10:35',
      4: '10:45 - 11:30',
      5: '11:40 - 12:25',
      6: '12:35 - 13:20',
      7: '13:30 - 14:15',
      8: '14:25 - 15:10',
    };
    return times[lessonNumber] || 'Время не указано';
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка расписания...</div>
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
      <Card>
        <Card.Header>
          <Card.Title>Мое расписание</Card.Title>
          <Card.Description>
            Расписание ваших занятий на неделю
          </Card.Description>
        </Card.Header>
      </Card>

      {/* Расписание по дням */}
      <div className="grid gap-4">
        {scheduleByDay.map((day) => (
          <Card key={day.number}>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title className="text-xl">{day.name}</Card.Title>
                <Badge variant="secondary">
                  {day.lessons.length} {day.lessons.length === 1 ? 'урок' : 'уроков'}
                </Badge>
              </div>
            </Card.Header>
            <Card.Content>
              {day.lessons.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Нет занятий
                </div>
              ) : (
                <div className="space-y-3">
                  {day.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
                          {lesson.lessonNumber || '-'}
                        </div>
                        <div>
                          <div className="font-medium">
                            {lesson?.subject?.name || 'Не указан'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lesson?.class?.name || 'Класс не указан'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {lesson?.room && (
                          <Badge variant="outline" className="mb-1">
                            Каб. {lesson.room}
                          </Badge>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {getLessonTime(lesson?.lessonNumber)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherScheduleView;

