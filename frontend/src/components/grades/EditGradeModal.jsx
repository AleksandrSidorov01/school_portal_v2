import { useState, useEffect } from 'react';
import { gradeService } from '../../services/grade.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateGradeForm } from '../../utils/validation.js';
import Card from '../ui/Card.jsx';
import FormField from '../ui/FormField.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';

const EditGradeModal = ({ grade, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    value: '',
    comment: '',
    date: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (grade) {
      // Если grade не содержит полных данных, загружаем их
      if (!grade.student || !grade.subject) {
        loadGradeDetails();
      } else {
        setFormData({
          value: grade.value?.toString() || '',
          comment: grade.comment || '',
          date: grade.date ? new Date(grade.date).toISOString().split('T')[0] : '',
        });
      }
    }
  }, [grade]);

  const loadGradeDetails = async () => {
    try {
      const response = await gradeService.getGradeById(grade.id);
      if (response) {
        setFormData({
          value: response.value?.toString() || '',
          comment: response.comment || '',
          date: response.date ? new Date(response.date).toISOString().split('T')[0] : '',
        });
      }
    } catch (err) {
      console.error('Ошибка загрузки данных оценки:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Очищаем ошибку для этого поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Валидация формы
    const validation = validateGradeForm({
      ...formData,
      studentId: gradeData?.studentId || grade?.studentId,
      subjectId: gradeData?.subjectId || grade?.subjectId,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await gradeService.deleteGrade(grade.id);
      showToast('Оценка успешно удалена', 'success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      showToast('Ошибка при удалении оценки', 'error');
      console.error(err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (!grade) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl m-4">
          <Card.Content>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Загрузка данных...</div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <Card.Header>
          <Card.Title>Редактировать оценку</Card.Title>
          <Card.Description>
            {gradeData?.subject?.name || grade?.subject?.name || 'Предмет'} - {gradeData?.student?.user?.firstName || grade?.student?.user?.firstName || ''} {gradeData?.student?.user?.lastName || grade?.student?.user?.lastName || ''}
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
              <FormField label="Оценка" error={errors.value} required>
                <select
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors.value ? 'border-destructive' : ''}`}
                >
                  <option value="">Выберите оценку</option>
                  <option value="5">5 (Отлично)</option>
                  <option value="4">4 (Хорошо)</option>
                  <option value="3">3 (Удовлетворительно)</option>
                  <option value="2">2 (Неудовлетворительно)</option>
                </select>
              </FormField>

              <FormField label="Дата" error={errors.date} required>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors.date ? 'border-destructive' : ''}`}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Комментарий">
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Добавьте комментарий (необязательно)"
                  />
                </FormField>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDeleteClick}
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление оценки"
        message="Вы уверены, что хотите удалить эту оценку? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </div>
  );
};

export default EditGradeModal;

