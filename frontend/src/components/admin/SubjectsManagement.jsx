import { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/admin.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import CreateSubjectModal from './CreateSubjectModal.jsx';

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllSubjects();
      setSubjects(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить предметы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (subject) => {
    setDeleteConfirm({
      subjectId: subject.id,
      subjectName: subject.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await adminService.deleteSubject(deleteConfirm.subjectId);
      showToast('Предмет успешно удален', 'success');
      await loadSubjects();
    } catch (err) {
      showToast('Ошибка при удалении предмета', 'error');
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Фильтрация и поиск
  const filteredSubjects = useMemo(() => {
    let filtered = subjects;

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(query) ||
        (subject.description && subject.description.toLowerCase().includes(query)) ||
        (subject.teacher && (
          subject.teacher.user.firstName.toLowerCase().includes(query) ||
          subject.teacher.user.lastName.toLowerCase().includes(query)
        ))
      );
    }

    return filtered;
  }, [subjects, searchQuery]);

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Управление предметами</Card.Title>
          <Card.Description>Загрузка...</Card.Description>
        </Card.Header>
        <Card.Content>
          <TableSkeleton rows={5} columns={4} />
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
              <Card.Title>Управление предметами</Card.Title>
              <Card.Description>
                Всего предметов: {subjects.length} {filteredSubjects.length !== subjects.length && `(найдено: ${filteredSubjects.length})`}
              </Card.Description>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              + Создать предмет
            </button>
          </div>
        </Card.Header>
        <Card.Content>
          {/* Поиск */}
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, описанию, учителю..."
            />
          </div>

          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Предметы не найдены' : 'Предметов пока нет'}
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Название</Table.Head>
                  <Table.Head>Описание</Table.Head>
                  <Table.Head>Учитель</Table.Head>
                  <Table.Head>Действия</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredSubjects.map((subject) => (
                  <Table.Row key={subject.id}>
                    <Table.Cell className="font-medium">{subject.name}</Table.Cell>
                    <Table.Cell className="text-muted-foreground">
                      {subject.description || '-'}
                    </Table.Cell>
                    <Table.Cell>
                      {subject.teacher ? (
                        `${subject.teacher.user.firstName} ${subject.teacher.user.lastName}`
                      ) : (
                        <span className="text-muted-foreground text-sm">Не назначен</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleDeleteClick(subject)}
                        className="text-destructive hover:text-destructive/80 text-sm"
                      >
                        Удалить
                      </button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
      </Card>

      {showCreateModal && (
        <CreateSubjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadSubjects();
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Удаление предмета"
          message={`Вы уверены, что хотите удалить предмет "${deleteConfirm.subjectName}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      )}
    </div>
  );
};

export default SubjectsManagement;
