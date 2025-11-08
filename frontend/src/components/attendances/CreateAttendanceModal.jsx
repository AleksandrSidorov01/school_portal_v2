import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance.service.js';
import { scheduleService } from '../../services/schedule.service.js';
import { classService } from '../../services/class.service.js';
import { teacherService } from '../../services/teacher.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';
import Select from '../ui/Select.jsx';
import FormField from '../ui/FormField.jsx';
import Input from '../ui/Input.jsx';

const CreateAttendanceModal = ({ isOpen, onClose, onSuccess, classId, scheduleId, date }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [formData, setFormData] = useState({
    scheduleId: scheduleId || '',
    date: date || new Date().toISOString().split('T')[0],
    attendances: [],
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, classId, scheduleId, date, user]);

  const loadData = async () => {
    try {
      let currentClassId = classId;
      let currentScheduleId = scheduleId;
      let currentTeacherId = null;

      // Загружаем информацию об учителе
      if (user?.role === 'TEACHER') {
        const info = await teacherService.getMyInfo();
        setTeacherInfo(info);
        currentTeacherId = info?.teacher?.id;
      }

      // Если передан scheduleId, получаем класс из расписания
      if (scheduleId && !classId) {
        const schedulesData = await scheduleService.getAllSchedules({});
        const schedule = schedulesData.find(s => s.id === scheduleId);
        if (schedule && schedule.class) {
          currentClassId = schedule.class.id;
        }
      }

      // Загружаем расписания только для предметов учителя
      if (!scheduleId) {
        if (user?.role === 'TEACHER' && currentTeacherId) {
          // Загружаем только расписания этого учителя
          const schedulesData = await scheduleService.getAllSchedules({
            teacherId: currentTeacherId,
          });
          setSchedules(schedulesData);
        } else if (user?.role === 'ADMIN') {
          // Для админа загружаем все
          const schedulesData = await scheduleService.getAllSchedules();
          setSchedules(schedulesData);
        } else {
          setSchedules([]);
        }
      } else {
        currentScheduleId = scheduleId;
        setFormData((prev) => ({ ...prev, scheduleId: currentScheduleId }));
      }

      // Загружаем учеников класса
      if (currentClassId) {
        const classData = await classService.getClassById(currentClassId);
        const classStudents = classData.students || [];
        setStudents(classStudents);
        setFormData((prev) => ({
          ...prev,
          attendances: classStudents.map((s) => ({
            studentId: s.id,
            status: 'present',
            comment: '',
          })),
        }));
      }

      if (date) {
        setFormData((prev) => ({ ...prev, date }));
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setFormData((prev) => ({
      ...prev,
      attendances: prev.attendances.map((a) =>
        a.studentId === studentId ? { ...a, status } : a
      ),
    }));
  };

  const handleCommentChange = (studentId, comment) => {
    setFormData((prev) => ({
      ...prev,
      attendances: prev.attendances.map((a) =>
        a.studentId === studentId ? { ...a, comment } : a
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.scheduleId) {
        alert('Пожалуйста, выберите расписание');
        return;
      }

      if (formData.attendances.length === 0) {
        alert('Нет учеников для отметки посещаемости');
        return;
      }

      // Получаем classId из расписания, если не передан
      let currentClassId = classId;
      if (!currentClassId && formData.scheduleId) {
        const schedulesData = await scheduleService.getAllSchedules({});
        const schedule = schedulesData.find(s => s.id === formData.scheduleId);
        if (schedule && schedule.class) {
          currentClassId = schedule.class.id;
        }
      }

      if (currentClassId && formData.scheduleId) {
        await attendanceService.createAttendancesForClass({
          classId: currentClassId,
          scheduleId: formData.scheduleId,
          date: formData.date,
          attendances: formData.attendances,
        });
      } else {
        // Создание одной записи
        const attendance = formData.attendances[0];
        if (!attendance) {
          alert('Выберите ученика');
          return;
        }
        await attendanceService.createAttendance({
          studentId: attendance.studentId,
          scheduleId: formData.scheduleId,
          date: formData.date,
          status: attendance.status,
          comment: attendance.comment,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Ошибка создания посещаемости:', err);
      alert(err.response?.data?.message || err.message || 'Ошибка создания посещаемости');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-4">Отметить посещаемость</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!scheduleId && (
            <FormField label="Расписание" required>
              <Select
                value={formData.scheduleId}
                onChange={async (e) => {
                  const selectedScheduleId = e.target.value;
                  setFormData({ ...formData, scheduleId: selectedScheduleId });
                  
                  // Загружаем класс из расписания
                  if (selectedScheduleId) {
                    try {
                      // Используем уже загруженные расписания
                      const schedule = schedules.find(s => s.id === selectedScheduleId);
                      if (schedule && schedule.class) {
                        const classData = await classService.getClassById(schedule.class.id);
                        const classStudents = classData.students || [];
                        setStudents(classStudents);
                        setFormData((prev) => ({
                          ...prev,
                          scheduleId: selectedScheduleId,
                          attendances: classStudents.map((s) => ({
                            studentId: s.id,
                            status: 'present',
                            comment: '',
                          })),
                        }));
                      }
                    } catch (err) {
                      console.error('Ошибка загрузки класса:', err);
                    }
                  }
                }}
                required
              >
                <option value="">Выберите расписание</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.subject?.name || 'Предмет'} - {schedule.class?.name || 'Класс'}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Дата" required>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </FormField>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Ученики:</h3>
            {formData.attendances.map((attendance) => {
              const student = students.find((s) => s.id === attendance.studentId);
              if (!student) return null;

              return (
                <div key={attendance.studentId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      {student.user.firstName} {student.user.lastName}
                    </span>
                    <Select
                      value={attendance.status}
                      onChange={(e) => handleStatusChange(attendance.studentId, e.target.value)}
                      className="w-48"
                    >
                      <option value="present">Присутствовал</option>
                      <option value="absent">Отсутствовал</option>
                      <option value="late">Опоздал</option>
                      <option value="excused">Уважительная причина</option>
                    </Select>
                  </div>
                  <Input
                    placeholder="Комментарий (необязательно)"
                    value={attendance.comment}
                    onChange={(e) => handleCommentChange(attendance.studentId, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAttendanceModal;

