import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendance.service.js';
import Card from '../ui/Card.jsx';
import Select from '../ui/Select.jsx';

const AttendancesList = ({ studentId, scheduleId, date, teacherId }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendances();
  }, [studentId, scheduleId, date, teacherId]);

  const loadAttendances = async () => {
    try {
      const params = {};
      if (studentId) params.studentId = studentId;
      if (scheduleId) params.scheduleId = scheduleId;
      if (date) params.date = date;
      if (teacherId) {
        // Получаем все расписания учителя и фильтруем посещаемость
        // Это упрощенная версия, в реальности можно добавить фильтр на бэкенде
      }

      const data = await attendanceService.getAllAttendances(params);
      setAttendances(data);
    } catch (err) {
      console.error('Ошибка загрузки посещаемости:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      present: 'Присутствовал',
      absent: 'Отсутствовал',
      late: 'Опоздал',
      excused: 'Уважительная причина',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-muted-foreground">Загрузка...</div>;
  }

  if (attendances.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Нет записей о посещаемости</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {attendances.map((attendance) => (
        <Card key={attendance.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="font-semibold text-foreground">
                  {attendance.student.user.firstName} {attendance.student.user.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {attendance.schedule.subject.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(attendance.date).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {attendance.comment && (
                <p className="text-sm text-muted-foreground">{attendance.comment}</p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                attendance.status
              )}`}
            >
              {getStatusLabel(attendance.status)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AttendancesList;

