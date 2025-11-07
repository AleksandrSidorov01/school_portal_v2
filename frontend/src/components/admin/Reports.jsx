import { useState, useEffect } from 'react';
import { gradeService } from '../../services/grade.service.js';
import { classService } from '../../services/class.service.js';
import { adminService } from '../../services/admin.service.js';
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

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      showToast('Нет данных для экспорта', 'warning');
      return;
    }

    let csv = '';
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

    csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Создаем и скачиваем файл
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Отчет успешно экспортирован', 'success');
  };

  const exportToJSON = () => {
    if (!reportData || reportData.length === 0) {
      showToast('Нет данных для экспорта', 'warning');
      return;
    }

    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Отчет успешно экспортирован', 'success');
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
                <>
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Экспорт в CSV
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Экспорт в JSON
                  </button>
                </>
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

