import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import CreateUserModal from './CreateUserModal.jsx';
import EditUserModal from './EditUserModal.jsx';
import CreateProfileModal from './CreateProfileModal.jsx';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingProfile, setCreatingProfile] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      alert('Ошибка при удалении пользователя');
      console.error(err);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'TEACHER':
        return 'default';
      case 'STUDENT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка пользователей...</div>
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
              <Card.Title>Управление пользователями</Card.Title>
              <Card.Description>
                Всего пользователей: {users.length}
              </Card.Description>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              + Создать пользователя
            </button>
          </div>
        </Card.Header>
        <Card.Content>
          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Пользователей пока нет
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Имя</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Роль</Table.Head>
                  <Table.Head>Профиль</Table.Head>
                  <Table.Head>Дата регистрации</Table.Head>
                  <Table.Head>Действия</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell className="font-medium">
                      {user.firstName} {user.lastName}
                    </Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {user.student && (
                        <Badge variant="outline">Ученик</Badge>
                      )}
                      {user.teacher && (
                        <Badge variant="outline">Учитель</Badge>
                      )}
                      {!user.student && !user.teacher && (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Редактировать
                        </button>
                        {!user.student && !user.teacher && (
                          <button
                            onClick={() => setCreatingProfile(user)}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            Создать профиль
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                          disabled={user.role === 'ADMIN'}
                        >
                          {user.role === 'ADMIN' ? '-' : 'Удалить'}
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
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}

      {creatingProfile && (
        <CreateProfileModal
          user={creatingProfile}
          onClose={() => setCreatingProfile(null)}
          onSuccess={() => {
            setCreatingProfile(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default UsersManagement;

