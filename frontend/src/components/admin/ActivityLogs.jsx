import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import Select from '../ui/Select.jsx';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    entity: 'all',
    action: 'all',
    search: '',
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.entity !== 'all') params.append('entity', filters.entity);
      if (filters.action !== 'all') params.append('action', filters.action);
      
      const data = await adminService.getActivityLogs(params.toString());
      setLogs(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить логи активности');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const user = log.user ? `${log.user.firstName} ${log.user.lastName}`.toLowerCase() : '';
      const details = log.details ? JSON.stringify(log.details).toLowerCase() : '';
      return user.includes(search) || details.includes(search);
    }
    return true;
  });

  const getActionBadgeVariant = (action) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'create':
        return 'Создание';
      case 'update':
        return 'Обновление';
      case 'delete':
        return 'Удаление';
      default:
        return action;
    }
  };

  const getEntityLabel = (entity) => {
    const labels = {
      user: 'Пользователь',
      class: 'Класс',
      subject: 'Предмет',
      grade: 'Оценка',
      student_profile: 'Профиль ученика',
      teacher_profile: 'Профиль учителя',
    };
    return labels[entity] || entity;
  };

  if (loading) {
    return (
      <Card>
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
          <Card.Title>История изменений</Card.Title>
          <Card.Description>
            Логи всех действий в системе
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {/* Фильтры */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <SearchBar
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Поиск по пользователю, деталям..."
            />
            <Select
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            >
              <option value="all">Все сущности</option>
              <option value="user">Пользователь</option>
              <option value="class">Класс</option>
              <option value="subject">Предмет</option>
              <option value="grade">Оценка</option>
              <option value="student_profile">Профиль ученика</option>
              <option value="teacher_profile">Профиль учителя</option>
            </Select>
            <Select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="all">Все действия</option>
              <option value="create">Создание</option>
              <option value="update">Обновление</option>
              <option value="delete">Удаление</option>
            </Select>
          </div>

          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Логов активности нет
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Дата</Table.Head>
                  <Table.Head>Пользователь</Table.Head>
                  <Table.Head>Действие</Table.Head>
                  <Table.Head>Сущность</Table.Head>
                  <Table.Head>Детали</Table.Head>
                  <Table.Head>IP адрес</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredLogs.map((log) => (
                  <Table.Row key={log.id}>
                    <Table.Cell className="text-muted-foreground text-sm">
                      {formatDate(log.createdAt)}
                    </Table.Cell>
                    <Table.Cell>
                      {log.user ? (
                        `${log.user.firstName} ${log.user.lastName}`
                      ) : (
                        <span className="text-muted-foreground">Система</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {getEntityLabel(log.entity)}
                    </Table.Cell>
                    <Table.Cell className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </Table.Cell>
                    <Table.Cell className="text-xs text-muted-foreground">
                      {log.ipAddress || '-'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default ActivityLogs;

