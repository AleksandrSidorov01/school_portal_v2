const BarChart = ({ data, xKey, yKey, label, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет данных для отображения
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => parseFloat(item[yKey]) || 0));
  const minValue = Math.min(...data.map(item => parseFloat(item[yKey]) || 0));
  const range = maxValue - minValue || 1;

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="relative h-full flex items-end justify-between gap-2">
        {data.map((item, index) => {
          const value = parseFloat(item[yKey]) || 0;
          const percentage = ((value - minValue) / range) * 100;
          const color = value >= 4.5 ? '#10b981' : value >= 3.5 ? '#3b82f6' : value >= 2.5 ? '#f59e0b' : '#ef4444';

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex items-end justify-center" style={{ height: '90%' }}>
                <div
                  className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${Math.max(percentage, 5)}%`,
                    backgroundColor: color,
                    minHeight: '20px',
                  }}
                  title={`${item[xKey]}: ${value}`}
                />
                <div className="absolute -top-6 text-xs font-medium">
                  {value}
                </div>
              </div>
              <div className="text-xs text-center text-muted-foreground truncate w-full" title={item[xKey]}>
                {item[xKey]}
              </div>
            </div>
          );
        })}
      </div>
      {label && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          {label}
        </div>
      )}
    </div>
  );
};

export default BarChart;

