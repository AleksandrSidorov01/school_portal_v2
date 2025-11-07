import { useState, useEffect } from 'react';
import { gradeService } from '../../services/grade.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../ui/Card.jsx';

const EditGradeModal = ({ grade, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    value: '',
    comment: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (grade) {
      setFormData({
        value: grade.value?.toString() || '',
        comment: grade.comment || '',
        date: grade.date ? new Date(grade.date).toISOString().split('T')[0] : '',
      });
    }
  }, [grade]);

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
      await gradeService.updateGrade(grade.id, formData);
      showToast('Оценка успешно обновлена', 'success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка при обновлении оценки';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту оценку?')) {
      return;
    }

    try {
      await gradeService.deleteGrade(grade.id);
      showToast('Оценка успешно удалена', 'success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      showToast('Ошибка при удалении оценки', 'error');
      console.error(err);
    }
  };

  if (!grade) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <Card.Header>
          <Card.Title>Редактировать оценку</Card.Title>
          <Card.Description>
            {grade.subject?.name} - {grade.student?.user?.firstName} {grade.student?.user?.lastName}
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

              <div className="md:col-span-2">
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
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                Удалить
              </button>
              <div className="flex gap-2">
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
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default EditGradeModal;

