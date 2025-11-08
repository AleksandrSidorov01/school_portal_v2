import { useState, useEffect } from 'react';
import { homeworkService } from '../../services/homework.service.js';
import { classService } from '../../services/class.service.js';
import { teacherService } from '../../services/teacher.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import FormField from '../ui/FormField.jsx';

const CreateHomeworkModal = ({ isOpen, onClose, onSuccess, teacherId, classId, subjectId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    subjectId: subjectId || '',
    teacherId: teacherId || user?.teacher?.id || '',
    studentId: '',
    classId: classId || '',
    title: '',
    description: '',
    dueDate: '',
    attachments: [],
  });
  const [attachmentUrl, setAttachmentUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, teacherId, classId, subjectId]);

  const loadData = async () => {
    try {
      const currentTeacherId = teacherId || user?.teacher?.id;
      if (currentTeacherId) {
        try {
          const teacherData = await teacherService.getTeacherById(currentTeacherId);
          setSubjects(teacherData.subjects || []);
          setFormData((prev) => ({ ...prev, teacherId: currentTeacherId, subjectId: subjectId || prev.subjectId }));
        } catch (err) {
          console.error('Ошибка загрузки учителя:', err);
        }
      }
      if (classId) {
        const classData = await classService.getClassById(classId);
        setStudents(classData.students || []);
        setFormData((prev) => ({ ...prev, classId }));
      } else {
        const classesData = await classService.getAllClasses();
        setClasses(classesData);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        studentId: formData.studentId || null,
        classId: formData.classId || null,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
      };
      await homeworkService.createHomework(data);
      onSuccess?.();
      onClose();
      setFormData({
        subjectId: subjectId || '',
        teacherId: teacherId || '',
        studentId: '',
        classId: classId || '',
        title: '',
        description: '',
        dueDate: '',
        attachments: [],
      });
      setAttachmentUrl('');
    } catch (err) {
      console.error('Ошибка создания домашнего задания:', err);
      alert(err.response?.data?.message || 'Ошибка создания домашнего задания');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-4">Создать домашнее задание</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Предмет" required>
            <Select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            >
              <option value="">Выберите предмет</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </FormField>

          {!classId && (
            <FormField label="Класс">
              <Select
                value={formData.classId}
                onChange={(e) => {
                  setFormData({ ...formData, classId: e.target.value, studentId: '' });
                  if (e.target.value) {
                    classService.getClassById(e.target.value).then((classData) => {
                      setStudents(classData.students || []);
                    });
                  } else {
                    setStudents([]);
                  }
                }}
              >
                <option value="">Для всего класса</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {formData.classId && (
            <FormField label="Ученик">
              <Select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              >
                <option value="">Для всего класса</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.firstName} {student.user.lastName}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Название" required>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Описание" required>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              rows={4}
              required
            />
          </FormField>

          <FormField label="Дедлайн" required>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Прикрепленные файлы (необязательно)">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="URL файла (например, ссылка на Google Drive, лекцию и т.д.)"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (attachmentUrl.trim()) {
                        setFormData({
                          ...formData,
                          attachments: [...formData.attachments, attachmentUrl.trim()],
                        });
                        setAttachmentUrl('');
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (attachmentUrl.trim()) {
                      setFormData({
                        ...formData,
                        attachments: [...formData.attachments, attachmentUrl.trim()],
                      });
                      setAttachmentUrl('');
                    }
                  }}
                >
                  Добавить
                </Button>
              </div>
              {formData.attachments.length > 0 && (
                <div className="space-y-1">
                  {formData.attachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="truncate flex-1">{url}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            attachments: formData.attachments.filter((_, i) => i !== index),
                          });
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHomeworkModal;

