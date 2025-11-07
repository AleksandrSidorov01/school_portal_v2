import { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacher.service.js';
import api from '../../config/api.js';
import Card from '../ui/Card.jsx';

const EditClassModal = ({ classItem, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    description: '',
    classTeacherId: '',
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        grade: classItem.grade || '',
        description: classItem.description || '',
        classTeacherId: classItem.classTeacherId || '',
      });
    }
    loadTeachers();
  }, [classItem]);

  const loadTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers();
      setTeachers(response || []);
    } catch (err) {
      console.error('Ошибка загрузки учителей:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        grade: parseInt(formData.grade),
        description: formData.description || undefined,
        classTeacherId: formData.classTeacherId || null,
      };
      await api.put(`/classes/${classItem.id}`, data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении класса');
    } finally {
      setLoading(false);
    }
  };

  if (!classItem) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <Card.Header>
          <Card.Title>Редактировать класс</Card.Title>
          <Card.Description>
            Измените данные класса или назначьте классного руководителя
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название класса *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Класс (номер) *
                </label>
                <input
                  type="number"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  min="1"
                  max="11"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Классный руководитель
                </label>
                <select
                  name="classTeacherId"
                  value={formData.classTeacherId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Не назначен</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.firstName} {teacher.user.lastName}
                      {teacher.specialization && ` (${teacher.specialization})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default EditClassModal;

