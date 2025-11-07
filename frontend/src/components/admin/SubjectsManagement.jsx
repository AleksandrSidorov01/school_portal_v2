import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { teacherService } from '../../services/teacher.service.js';
import api from '../../config/api.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import CreateSubjectModal from './CreateSubjectModal.jsx';

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleDelete = async (subjectId) => {
    if (!confirm('Вы уверены, что хотите удалить этот предмет?')) {
      return;
    }

    try {
      await adminService.deleteSubject(subjectId);
      await loadSubjects();
    } catch (err) {
      alert('Ошибка при удалении предмета');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка предметов...</div>
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
              <Card.Title>Управление предметами</Card.Title>
              <Card.Description>
                Всего предметов: {subjects.length}
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
          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Предметов пока нет
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
                {subjects.map((subject) => (
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
                        onClick={() => handleDelete(subject.id)}
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
    </div>
  );
};

export default SubjectsManagement;

