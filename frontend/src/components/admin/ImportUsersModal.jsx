import { useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import { useToast } from '../../context/ToastContext.jsx';
import { readCSVFile, validateImportedUsers } from '../../utils/import.js';
import Card from '../ui/Card.jsx';
import FormField from '../ui/FormField.jsx';

const ImportUsersModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const { showToast } = useToast();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setPreview(null);
    setImportResults(null);

    try {
      const parsed = await readCSVFile(selectedFile);
      const validation = validateImportedUsers(parsed.data);

      setPreview({
        total: parsed.data.length,
        valid: validation.validUsers.length,
        errors: validation.errors,
      });

      if (validation.errors.length > 0) {
        setError(`Найдено ${validation.errors.length} ошибок в данных. Проверьте файл.`);
      }
    } catch (err) {
      setError(err.message);
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Выберите файл для импорта');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsed = await readCSVFile(file);
      const validation = validateImportedUsers(parsed.data);

      if (validation.validUsers.length === 0) {
        setError('Нет валидных пользователей для импорта');
        setLoading(false);
        return;
      }

      // Импортируем пользователей
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const user of validation.validUsers) {
        try {
          await adminService.createUser(user);
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push({
            email: user.email,
            error: err.response?.data?.message || 'Ошибка создания пользователя',
          });
        }
      }

      setImportResults({
        success: successCount,
        errors: errorCount,
        errorDetails: errors,
      });

      if (successCount > 0) {
        showToast(`Успешно импортировано: ${successCount}${errorCount > 0 ? `, ошибок: ${errorCount}` : ''}`, 'success');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        showToast('Не удалось импортировать пользователей', 'error');
      }
    } catch (err) {
      setError(err.message || 'Ошибка при импорте файла');
      showToast('Ошибка при импорте файла', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
        <Card.Header>
          <Card.Title>Импорт пользователей из CSV</Card.Title>
          <Card.Description>
            Загрузите CSV файл с пользователями для массового импорта
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <FormField label="CSV файл" required>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Формат CSV: email, password, firstName, lastName, role (опционально)
              </div>
            </FormField>

            {preview && (
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm font-medium mb-2">Предпросмотр:</div>
                <div className="text-sm space-y-1">
                  <div>Всего строк: {preview.total}</div>
                  <div className="text-green-600">Валидных: {preview.valid}</div>
                  {preview.errors.length > 0 && (
                    <div className="text-red-600">Ошибок: {preview.errors.length}</div>
                  )}
                </div>

                {preview.errors.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto">
                    <div className="text-sm font-medium mb-2">Ошибки валидации:</div>
                    {preview.errors.slice(0, 10).map((err, index) => (
                      <div key={index} className="text-xs text-red-600 mb-1">
                        Строка {err.row}: {err.errors.join(', ')}
                      </div>
                    ))}
                    {preview.errors.length > 10 && (
                      <div className="text-xs text-muted-foreground">
                        ... и еще {preview.errors.length - 10} ошибок
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {importResults && (
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm font-medium mb-2">Результаты импорта:</div>
                <div className="text-sm space-y-1">
                  <div className="text-green-600">Успешно: {importResults.success}</div>
                  {importResults.errors > 0 && (
                    <div className="text-red-600">Ошибок: {importResults.errors}</div>
                  )}
                </div>

                {importResults.errorDetails && importResults.errorDetails.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto">
                    <div className="text-sm font-medium mb-2">Детали ошибок:</div>
                    {importResults.errorDetails.slice(0, 10).map((err, index) => (
                      <div key={index} className="text-xs text-red-600 mb-1">
                        {err.email}: {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Отмена
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !file || !preview || preview.valid === 0}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {loading ? 'Импорт...' : 'Импортировать'}
              </button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ImportUsersModal;

