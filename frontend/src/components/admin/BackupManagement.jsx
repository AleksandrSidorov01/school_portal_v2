import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../ui/Card.jsx';
import { TableSkeleton } from '../ui/LoadingSkeleton.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBackups();
      setBackups(data || []);
    } catch (err) {
      showToast('Ошибка при загрузке резервных копий', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const result = await adminService.createBackup();
      showToast('Резервная копия успешно создана', 'success');
      await loadBackups();
    } catch (err) {
      showToast('Ошибка при создании резервной копии', 'error');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/backup/${filename}`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при скачивании');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showToast('Резервная копия успешно скачана', 'success');
    } catch (err) {
      showToast('Ошибка при скачивании резервной копии', 'error');
      console.error(err);
    }
  };

  const handleDeleteClick = (filename) => {
    setDeleteConfirm({ filename });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await adminService.deleteBackup(deleteConfirm.filename);
      showToast('Резервная копия успешно удалена', 'success');
      await loadBackups();
    } catch (err) {
      showToast('Ошибка при удалении резервной копии', 'error');
      console.error(err);
    } finally {
      setDeleteConfirm(null);
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

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
  };

  if (loading) {
    return (
      <Card>
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
              <Card.Title>Резервное копирование</Card.Title>
              <Card.Description>
                Управление резервными копиями базы данных
              </Card.Description>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {creating ? 'Создание...' : '+ Создать резервную копию'}
            </button>
          </div>
        </Card.Header>
        <Card.Content>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Резервных копий пока нет
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.filename}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{backup.filename}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(backup.createdAt)} • {formatSize(backup.size)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(backup.filename)}
                      className="text-primary hover:text-primary/80 text-sm px-3 py-1"
                    >
                      Скачать
                    </button>
                    <button
                      onClick={() => handleDeleteClick(backup.filename)}
                      className="text-destructive hover:text-destructive/80 text-sm px-3 py-1"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Удаление резервной копии"
          message={`Вы уверены, что хотите удалить резервную копию "${deleteConfirm.filename}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          cancelText="Отмена"
          variant="destructive"
        />
      )}
    </div>
  );
};

export default BackupManagement;

