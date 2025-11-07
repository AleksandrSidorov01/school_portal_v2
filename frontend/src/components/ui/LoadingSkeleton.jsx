import Skeleton from './Skeleton.jsx';
import Card from './Card.jsx';

// Скелетон для таблицы
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {/* Заголовок таблицы */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" variant="text" />
        ))}
      </div>
      {/* Строки таблицы */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Скелетон для карточки
export const CardSkeleton = () => {
  return (
    <Card>
      <Card.Header>
        <Skeleton className="h-6 w-48 mb-2" variant="text" />
        <Skeleton className="h-4 w-64" variant="text" />
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-3/4" variant="text" />
          <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
      </Card.Content>
    </Card>
  );
};

// Скелетон для списка
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Скелетон для формы
export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-10 w-full" variant="rectangular" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24" variant="rectangular" />
        <Skeleton className="h-10 w-24" variant="rectangular" />
      </div>
    </div>
  );
};

export default Skeleton;

