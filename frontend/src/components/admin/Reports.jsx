import { useState, useEffect } from 'react';
import { gradeService } from '../../services/grade.service.js';
import { classService } from '../../services/class.service.js';
import { adminService } from '../../services/admin.service.js';
import { exportToCSV, exportToJSON, exportToExcel, exportToPDF, dataToHTMLTable } from '../../utils/export.js';
import Card from '../ui/Card.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('grades');
  const [reportData, setReportData] = useState(null);
  const { showToast } = useToast();

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      
      switch (reportType) {
        case 'grades':
          data = await gradeService.getAllGrades();
          break;
        case 'classes':
          data = await classService.getAllClasses();
          break;
        case 'subjects':
          data = await adminService.getAllSubjects();
          break;
        default:
          data = [];
      }

      setReportData(data);
      showToast('Отчет успешно сгенерирован', 'success');
    } catch (err) {
      showToast('Ошибка при генерации отчета', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!reportData || reportData.length === 0) {
      showToast('Нет данных для экспорта', 'warning');
      return;
    }

    try {
      let headers = [];
      let rows = [];

      switch (reportType) {
        case 'grades':
          headers = ['Дата', 'Ученик', 'Предмет', 'Оценка', 'Учитель', 'Комментарий'];
          rows = reportData.map(grade => [
            grade.date ? new Date(grade.date).toLocaleDateString('ru-RU') : '',
            grade.student?.user ? `${grade.student.user.firstName} ${grade.student.user.lastName}` : '',
            grade.subject?.name || '',
            grade.value || '',
            grade.teacher?.user ? `${grade.teacher.user.firstName} ${grade.teacher.user.lastName}` : '',
            grade.comment || '',
          ]);
          break;
        case 'classes':
          headers = ['Название', 'Класс', 'Учеников', 'Классный руководитель'];
          rows = reportData.map(cls => [
            cls.name || '',
            cls.grade || '',
            cls.students?.length || 0,
            cls.classTeacher?.user ? `${cls.classTeacher.user.firstName} ${cls.classTeacher.user.lastName}` : '',
          ]);
          break;
        case 'subjects':
          headers = ['Название', 'Описание', 'Учитель'];
          rows = reportData.map(subject => [
            subject.name || '',
            subject.description || '',
            subject.teacher?.user ? `${subject.teacher.user.firstName} ${subject.teacher.user.lastName}` : '',
          ]);
          break;
      }

      switch (format) {
        case 'csv':
          exportToCSV(rows, headers, `report_${reportType}`);
          showToast('Отчет успешно экспортирован в CSV', 'success');
          break;
        case 'json':
          exportToJSON(reportData, `report_${reportType}`);
          showToast('Отчет успешно экспортирован в JSON', 'success');
          break;
        case 'excel':
          exportToExcel(rows, headers, `report_${reportType}`);
          showToast('Отчет успешно экспортирован в Excel', 'success');
          break;
        case 'pdf':
          const htmlContent = dataToHTMLTable(rows, headers);
          exportToPDF(`Отчет: ${reportType}`, htmlContent, `report_${reportType}`);
          showToast('Открыто окно печати для PDF', 'info');
          break;
        default:
          showToast('Неизвестный формат экспорта', 'error');
      }
    } catch (err) {
      showToast('Ошибка при экспорте отчета', 'error');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Генерация отчетов</Card.Title>
          <Card.Description>
            Создайте и экспортируйте отчеты по различным данным системы
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Тип отчета
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="grades">Отчет по оценкам</option>
                <option value="classes">Отчет по классам</option>
                <option value="subjects">Отчет по предметам</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateReport}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {loading ? 'Генерация...' : 'Сгенерировать отчет'}
              </button>

              {reportData && reportData.length > 0 && (
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
              )}
            </div>

            {reportData && reportData.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="text-sm font-medium mb-2">
                  Статистика отчета:
                </div>
                <div className="text-sm text-muted-foreground">
                  Записей: {reportData.length}
                </div>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Reports;

