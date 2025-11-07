import { useState, useEffect } from 'react';
import { gradeService } from '../../services/grade.service.js';
import { classService } from '../../services/class.service.js';
import { teacherService } from '../../services/teacher.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../config/api.js';
import Card from '../ui/Card.jsx';

const CreateGradeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    classId: '',
    studentId: '',
    subjectId: '',
    value: '',
    comment: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [formData.classId]);

  const loadInitialData = async () => {
    try {
      const [classesData, teacherInfo] = await Promise.all([
        classService.getAllClasses(),
        teacherService.getMyInfo(),
      ]);
      
      setClasses(classesData || []);
      
      if (teacherInfo.teacher && teacherInfo.teacher.subjects) {
        setSubjects(teacherInfo.teacher.subjects);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const loadStudents = async () => {
    try {
      // Получаем всех студентов и фильтруем по классу, если выбран
      const response = await api.get('/students');
      let allStudents = response.data.students || [];
      
      // Если выбран класс, фильтруем студентов
      if (formData.classId) {
        allStudents = allStudents.filter(s => s.classId === formData.classId);
      }
      
      setStudents(allStudents);
    } catch (err) {
      console.error('Ошибка загрузки студентов:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Если изменился класс, сбрасываем выбор студента
    if (name === 'classId') {
      setFormData(prev => ({
        ...prev,
        studentId: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await gradeService.createGrade(formData);
      showToast('Оценка успешно выставлена!', 'success');
      setFormData({
        classId: '',
        studentId: '',
        subjectId: '',
        value: '',
        comment: '',
        date: new Date().toISOString().split('T')[0],
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка при выставлении оценки';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Выставить оценку</Card.Title>
        <Card.Description>
          Выберите ученика, предмет и выставьте оценку
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Класс
              </label>
              <select
                name="classId"
                value={formData.classId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Выберите класс</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.grade} класс)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ученик *
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                disabled={!formData.classId}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="">Выберите ученика</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.firstName} {student.user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Предмет *
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Выберите предмет</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Оценка *
              </label>
              <select
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Выберите оценку</option>
                <option value="5">5 (Отлично)</option>
                <option value="4">4 (Хорошо)</option>
                <option value="3">3 (Удовлетворительно)</option>
                <option value="2">2 (Неудовлетворительно)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Дата *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Комментарий
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Добавьте комментарий (необязательно)"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {loading ? 'Сохранение...' : 'Выставить оценку'}
            </button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};

export default CreateGradeForm;

