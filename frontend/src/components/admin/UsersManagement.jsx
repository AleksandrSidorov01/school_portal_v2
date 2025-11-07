import { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/admin.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import { exportToCSV, exportToJSON, exportToExcel, exportToPDF, dataToHTMLTable } from '../../utils/export.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import Select from '../ui/Select.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import CreateUserModal from './CreateUserModal.jsx';
import EditUserModal from './EditUserModal.jsx';
import CreateProfileModal from './CreateProfileModal.jsx';
import ImportUsersModal from './ImportUsersModal.jsx';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingProfile, setCreatingProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { showToast } = useToast();

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

  const handleDeleteClick = (user) => {
    setDeleteConfirm({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await adminService.deleteUser(deleteConfirm.userId);
      showToast('Пользователь успешно удален', 'success');
      await loadUsers();
    } catch (err) {
      showToast('Ошибка при удалении пользователя', 'error');
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Массовые операции
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId, checked) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === filteredUsers.length && filteredUsers.length > 0);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) {
      showToast('Выберите пользователей для удаления', 'warning');
      return;
    }

    setDeleteConfirm({
      userId: Array.from(selectedUsers),
      userName: `${selectedUsers.size} пользователей`,
      isBulk: true,
    });
  };

  const handleBulkDeleteConfirm = async () => {
    if (!deleteConfirm || !deleteConfirm.isBulk) return;

    try {
      const userIds = deleteConfirm.userId;
      let successCount = 0;
      let errorCount = 0;

      for (const userId of userIds) {
        try {
          await adminService.deleteUser(userId);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Ошибка удаления пользователя ${userId}:`, err);
        }
      }

      if (successCount > 0) {
        showToast(`Успешно удалено: ${successCount}${errorCount > 0 ? `, ошибок: ${errorCount}` : ''}`, 'success');
      } else {
        showToast('Не удалось удалить пользователей', 'error');
      }

      setSelectedUsers(new Set());
      setSelectAll(false);
      await loadUsers();
    } catch (err) {
      showToast('Ошибка при массовом удалении', 'error');
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Экспорт данных
  const handleExport = (format) => {
    try {
      const exportData = filteredUsers.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.student ? 'Ученик' : user.teacher ? 'Учитель' : '-',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '-',
      ]);

      const headers = ['Имя', 'Email', 'Роль', 'Профиль', 'Дата регистрации'];

      switch (format) {
        case 'csv':
          exportToCSV(exportData, headers, 'users');
          showToast('Данные экспортированы в CSV', 'success');
          break;
        case 'json':
          exportToJSON(filteredUsers, 'users');
          showToast('Данные экспортированы в JSON', 'success');
          break;
        case 'excel':
          exportToExcel(exportData, headers, 'users');
          showToast('Данные экспортированы в Excel', 'success');
          break;
        case 'pdf':
          const htmlContent = dataToHTMLTable(exportData, headers);
          exportToPDF('Список пользователей', htmlContent, 'users');
          showToast('Открыто окно печати для PDF', 'info');
          break;
        default:
          showToast('Неизвестный формат экспорта', 'error');
      }
    } catch (err) {
      showToast('Ошибка при экспорте данных', 'error');
      console.error(err);
    }
  };

  // Фильтрация и поиск
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Фильтр по роли
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, searchQuery, roleFilter]);

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
        <Card.Header>
          <Card.Title>Управление пользователями</Card.Title>
          <Card.Description>Загрузка...</Card.Description>
        </Card.Header>
        <Card.Content>
          <TableSkeleton rows={5} columns={6} />
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
                Всего пользователей: {users.length} {filteredUsers.length !== users.length && `(найдено: ${filteredUsers.length})`}
                {selectedUsers.size > 0 && ` • Выбрано: ${selectedUsers.size}`}
              </Card.Description>
            </div>
            <div className="flex gap-2">
              {selectedUsers.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                >
                  Удалить выбранные ({selectedUsers.size})
                </button>
              )}
              <div className="relative group">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Экспорт ▼
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    >
                      Экспорт в CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    >
                      Экспорт в JSON
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    >
                      Экспорт в Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                    >
                      Экспорт в PDF
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Импорт CSV
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                + Создать пользователя
              </button>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {/* Поиск и фильтры */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, email, роли..."
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Все роли</option>
              <option value="ADMIN">Администратор</option>
              <option value="TEACHER">Учитель</option>
              <option value="STUDENT">Ученик</option>
            </Select>
          </div>

          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || roleFilter !== 'all' ? 'Пользователи не найдены' : 'Пользователей пока нет'}
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Table.Head>
                  <Table.Head>Имя</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Роль</Table.Head>
                  <Table.Head>Профиль</Table.Head>
                  <Table.Head>Дата регистрации</Table.Head>
                  <Table.Head>Действия</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredUsers.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      />
                    </Table.Cell>
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
                          onClick={() => handleDeleteClick(user)}
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

      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={deleteConfirm.isBulk ? handleBulkDeleteConfirm : handleDeleteConfirm}
          title={deleteConfirm.isBulk ? "Массовое удаление пользователей" : "Удаление пользователя"}
          message={deleteConfirm.isBulk 
            ? `Вы уверены, что хотите удалить ${deleteConfirm.userName}? Это действие нельзя отменить.`
            : `Вы уверены, что хотите удалить пользователя "${deleteConfirm.userName}"? Это действие нельзя отменить.`
          }
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      )}

      {showImportModal && (
        <ImportUsersModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

export default UsersManagement;
