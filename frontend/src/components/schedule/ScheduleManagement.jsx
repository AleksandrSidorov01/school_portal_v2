import { useState, useEffect } from 'react';
import { scheduleService } from '../../services/schedule.service.js';
import { classService } from '../../services/class.service.js';
import { adminService } from '../../services/admin.service.js';
import { teacherService } from '../../services/teacher.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../config/api.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import CreateScheduleModal from './CreateScheduleModal.jsx';
import EditScheduleModal from './EditScheduleModal.jsx';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [classFilter, setClassFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (classFilter !== 'all') {
      loadSchedules();
    } else {
      loadSchedules();
    }
  }, [classFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, classesData, subjectsData, teachersData] = await Promise.all([
        scheduleService.getAllSchedules(),
        classService.getAllClasses(),
        adminService.getAllSubjects(),
        teacherService.getAllTeachers(),
      ]);
      setSchedules(schedulesData || []);
      setClasses(classesData || []);
      setSubjects(subjectsData || []);
      setTeachers(teachersData || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const filters = {};
      if (classFilter !== 'all') {
        filters.classId = classFilter;
      }
      const data = await scheduleService.getAllSchedules(filters);
      setSchedules(data || []);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись расписания?')) {
      return;
    }

    try {
      await api.delete(`/schedule/${scheduleId}`);
      showToast('Запись расписания успешно удалена', 'success');
      await loadSchedules();
    } catch (err) {
      showToast('Ошибка при удалении записи', 'error');
      console.error(err);
    }
  };

  const daysOfWeek = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
  ];

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

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Управление расписанием</Card.Title>
              <Card.Description>
                Всего записей: {schedules.length}
              </Card.Description>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              + Создать запись
            </button>
          </div>
        </Card.Header>
        <Card.Content>
          {/* Фильтр по классу */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Фильтр по классу
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Все классы</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade} класс)
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Записей расписания пока нет
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>День</Table.Head>
                  <Table.Head>Урок</Table.Head>
                  <Table.Head>Класс</Table.Head>
                  <Table.Head>Предмет</Table.Head>
                  <Table.Head>Учитель</Table.Head>
                  <Table.Head>Кабинет</Table.Head>
                  <Table.Head>Действия</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {schedules
                  .sort((a, b) => {
                    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
                    return a.lessonNumber - b.lessonNumber;
                  })
                  .map((schedule) => (
                    <Table.Row key={schedule.id}>
                      <Table.Cell>
                        {daysOfWeek[schedule.dayOfWeek - 1]}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">{schedule.lessonNumber}</Badge>
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        {schedule.class?.name || '-'}
                      </Table.Cell>
                      <Table.Cell>
                        {schedule.subject?.name || '-'}
                      </Table.Cell>
                      <Table.Cell>
                        {schedule.teacher?.user
                          ? `${schedule.teacher.user.firstName} ${schedule.teacher.user.lastName}`
                          : '-'
                        }
                      </Table.Cell>
                      <Table.Cell>
                        {schedule.room || '-'}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSchedule(schedule)}
                            className="text-primary hover:text-primary/80 text-sm"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-destructive hover:text-destructive/80 text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
      </Card>

      {showCreateModal && (
        <CreateScheduleModal
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadSchedules();
          }}
        />
      )}

      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          onClose={() => setEditingSchedule(null)}
          onSuccess={() => {
            setEditingSchedule(null);
            loadSchedules();
          }}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;

