import { useState, useEffect } from 'react';
import { classService } from '../../services/class.service.js';
import api from '../../config/api.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import CreateClassModal from './CreateClassModal.jsx';
import EditClassModal from './EditClassModal.jsx';

const ClassesManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

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

  const handleDelete = async (classId) => {
    if (!confirm('Вы уверены, что хотите удалить этот класс?')) {
      return;
    }

    try {
      await api.delete(`/classes/${classId}`);
      await loadData();
    } catch (err) {
      alert('Ошибка при удалении класса');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка классов...</div>
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
              <Card.Title>Управление классами</Card.Title>
              <Card.Description>
                Всего классов: {classes.length}
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
          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Классов пока нет
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
                {classes.map((cls) => (
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
                          onClick={() => handleDelete(cls.id)}
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
    </div>
  );
};

export default ClassesManagement;

