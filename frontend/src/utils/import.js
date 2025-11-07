// Импорт данных из CSV

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV файл пуст');
  }

  // Определяем разделитель (запятая или точка с запятой)
  const delimiter = csvText.includes(';') ? ';' : ',';
  
  // Парсим заголовки
  const headers = lines[0]
    .split(delimiter)
    .map(h => h.trim().replace(/^"|"$/g, ''))
    .filter(h => h);

  if (headers.length === 0) {
    throw new Error('Не найдены заголовки в CSV файле');
  }

  // Парсим данные
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Простой парсинг CSV (учитываем кавычки)
    const values = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          // Двойные кавычки - экранированная кавычка
          currentValue += '"';
          j++;
        } else {
          // Переключаем режим кавычек
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Конец значения
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Добавляем последнее значение
    values.push(currentValue.trim());

    // Создаем объект из строки
    if (values.length > 0 && values.some(v => v)) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }

  return { headers, data };
};

export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Файл не выбран'));
      return;
    }

    if (!file.name.endsWith('.csv')) {
      reject(new Error('Файл должен быть в формате CSV'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const parsed = parseCSV(csvText);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

// Валидация данных пользователей для импорта
export const validateImportedUsers = (data) => {
  const errors = [];
  const validUsers = [];

  data.forEach((row, index) => {
    const rowErrors = [];
    const user = {
      email: (row.email || row.Email || '').trim(),
      password: (row.password || row.Password || '').trim(),
      firstName: (row.firstName || row['First Name'] || row['Имя'] || '').trim(),
      lastName: (row.lastName || row['Last Name'] || row['Фамилия'] || '').trim(),
      role: (row.role || row.Role || 'STUDENT').trim().toUpperCase(),
    };

    // Валидация
    if (!user.email) {
      rowErrors.push('Email обязателен');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      rowErrors.push('Некорректный email');
    }

    if (!user.password) {
      rowErrors.push('Пароль обязателен');
    } else if (user.password.length < 6) {
      rowErrors.push('Пароль должен содержать минимум 6 символов');
    }

    if (!user.firstName) {
      rowErrors.push('Имя обязательно');
    }

    if (!user.lastName) {
      rowErrors.push('Фамилия обязательна');
    }

    if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(user.role)) {
      user.role = 'STUDENT'; // По умолчанию
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: index + 2, // +2 потому что первая строка - заголовки, индексация с 1
        errors: rowErrors,
        data: user,
      });
    } else {
      validUsers.push(user);
    }
  });

  return { validUsers, errors };
};

