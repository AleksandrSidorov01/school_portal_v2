// Экспорт данных в различные форматы

// Экспорт в CSV
export const exportToCSV = (data, headers, filename) => {
  if (!data || data.length === 0) {
    throw new Error('Нет данных для экспорта');
  }

  let csv = '';
  
  // Добавляем BOM для корректного отображения кириллицы в Excel
  csv = '\ufeff';
  
  // Заголовки
  csv += headers.map(h => `"${h}"`).join(',') + '\n';
  
  // Данные
  data.forEach(row => {
    csv += row.map(cell => {
      // Экранируем кавычки и переносы строк
      const cellValue = String(cell || '').replace(/"/g, '""');
      return `"${cellValue}"`;
    }).join(',') + '\n';
  });

  // Создаем и скачиваем файл
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Экспорт в JSON
export const exportToJSON = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('Нет данных для экспорта');
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Экспорт в Excel (XLSX) - используем простой CSV формат, который Excel может открыть
export const exportToExcel = (data, headers, filename) => {
  // Excel может открыть CSV с правильной кодировкой
  exportToCSV(data, headers, filename);
};

// Экспорт в PDF (простая реализация через печать)
export const exportToPDF = (title, content, filename) => {
  // Создаем временное окно для печати
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          h1 {
            color: #333;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Преобразование данных в HTML таблицу для PDF
export const dataToHTMLTable = (data, headers) => {
  let html = '<table><thead><tr>';
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  data.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell || ''}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
};

