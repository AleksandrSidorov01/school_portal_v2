import { useState, useEffect } from 'react';
import { classService } from '../../services/class.service.js';
import { teacherService } from '../../services/teacher.service.js';
import Card from '../ui/Card.jsx';
import ClassStudentsList from './ClassStudentsList.jsx';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getAllClasses();
      setClasses(data || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить классы');
      console.error(err);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Card>
        <Card.Content>
          <div className="text-destructive">{error}</div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Мои классы</Card.Title>
          <Card.Description>
            Выберите класс для просмотра учеников
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Классов пока нет
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedClassId === cls.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="font-semibold text-lg">{cls.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {cls.grade} класс
                  </div>
                  {cls.students && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Учеников: {cls.students.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {selectedClassId && (
        <ClassStudentsList classId={selectedClassId} />
      )}
    </div>
  );
};

export default ClassesList;

