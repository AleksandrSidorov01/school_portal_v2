import { useState, useEffect } from 'react';
import { classService } from '../../services/class.service.js';
import Card from '../ui/Card.jsx';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';

const ClassStudentsList = ({ classId }) => {
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classData, studentsData] = await Promise.all([
        classService.getClassById(classId),
        classService.getClassStudents(classId),
      ]);
      setClassInfo(classData);
      setStudents(studentsData || []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить данные');
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
            <div className="text-muted-foreground">Загрузка...</div>
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
    <Card>
      <Card.Header>
        <Card.Title>
          {classInfo ? `${classInfo.name} (${classInfo.grade} класс)` : 'Ученики класса'}
        </Card.Title>
        <Card.Description>
          Список учеников в классе ({students.length} {students.length === 1 ? 'ученик' : 'учеников'})
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            В классе пока нет учеников
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>№</Table.Head>
                <Table.Head>Имя</Table.Head>
                <Table.Head>Фамилия</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Номер в журнале</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {students.map((student, index) => (
                <Table.Row key={student.id}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell className="font-medium">
                    {student.user.firstName}
                  </Table.Cell>
                  <Table.Cell>{student.user.lastName}</Table.Cell>
                  <Table.Cell className="text-muted-foreground">
                    {student.user.email}
                  </Table.Cell>
                  <Table.Cell>
                    {student.studentNumber ? (
                      <Badge variant="outline">{student.studentNumber}</Badge>
                    ) : (
                      '-'
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card.Content>
    </Card>
  );
};

export default ClassStudentsList;

