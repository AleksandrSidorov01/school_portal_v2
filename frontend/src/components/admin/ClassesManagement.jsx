import { useState, useEffect, useMemo } from 'react';
import { classService } from '../../services/class.service.js';
import api from '../../config/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import Select from '../ui/Select.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import CreateClassModal from './CreateClassModal.jsx';
import EditClassModal from './EditClassModal.jsx';

const ClassesManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const classesData = await classService.getAllClasses();
      setClasses(classesData || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (classItem) => {
    setDeleteConfirm({
      classId: classItem.id,
      className: classItem.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/classes/${deleteConfirm.classId}`);
      showToast('Класс успешно удален', 'success');
      await loadData();
    } catch (err) {
      showToast('Ошибка при удалении класса', 'error');
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Фильтрация и поиск
  const filteredClasses = useMemo(() => {
    let filtered = classes;

    // Фильтр по классу
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(cls => cls.grade === parseInt(gradeFilter));
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(query) ||
        (cls.classTeacher && (
          cls.classTeacher.user.firstName.toLowerCase().includes(query) ||
          cls.classTeacher.user.lastName.toLowerCase().includes(query)
        ))
      );
    }

    return filtered;
  }, [classes, searchQuery, gradeFilter]);

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Управление классами</Card.Title>
          <Card.Description>Загрузка...</Card.Description>
        </Card.Header>
        <Card.Content>
          <TableSkeleton rows={5} columns={5} />
        </Card.Content>
      </Card>
    );
  }

  // Получить уникальные номера классов для фильтра
  const uniqueGrades = [...new Set(classes.map(cls => cls.grade))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Управление классами</Card.Title>
              <Card.Description>
                Всего классов: {classes.length} {filteredClasses.length !== classes.length && `(найдено: ${filteredClasses.length})`}
              </Card.Description>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              + Создать класс
            </button>
          </div>
        </Card.Header>
        <Card.Content>
          {/* Поиск и фильтры */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, классному руководителю..."
            />
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="all">Все классы</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade} класс</option>
              ))}
            </Select>
          </div>

          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || gradeFilter !== 'all' ? 'Классы не найдены' : 'Классов пока нет'}
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Название</Table.Head>
                  <Table.Head>Класс</Table.Head>
                  <Table.Head>Учеников</Table.Head>
                  <Table.Head>Классный руководитель</Table.Head>
                  <Table.Head>Действия</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredClasses.map((cls) => (
                  <Table.Row key={cls.id}>
                    <Table.Cell className="font-medium">{cls.name}</Table.Cell>
                    <Table.Cell>
                      <Badge variant="outline">{cls.grade} класс</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {cls.students ? cls.students.length : 0}
                    </Table.Cell>
                    <Table.Cell>
                      {cls.classTeacher ? (
                        `${cls.classTeacher.user.firstName} ${cls.classTeacher.user.lastName}`
                      ) : (
                        <span className="text-muted-foreground text-sm">Не назначен</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingClass(cls)}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cls)}
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
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {editingClass && (
        <EditClassModal
          classItem={editingClass}
          onClose={() => setEditingClass(null)}
          onSuccess={() => {
            setEditingClass(null);
            loadData();
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Удаление класса"
          message={`Вы уверены, что хотите удалить класс "${deleteConfirm.className}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      )}
    </div>
  );
};

export default ClassesManagement;
