const LineChart = ({ data, xKey, yKey, label, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет данных для отображения
      </div>
    );
  }

  const values = data.map(item => parseFloat(item[yKey]) || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const width = 100 / data.length;

  // Вычисляем точки для линии
  const points = data.map((item, index) => {
    const value = parseFloat(item[yKey]) || 0;
    const x = (index * width) + (width / 2);
    const y = 100 - (((value - minValue) / range) * 90);
    return { x, y, value, label: item[xKey] };
  });

  // Создаем SVG path для линии
  const pathData = points.map((point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Сетка */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Линия */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Точки */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="0.5"
            />
            <text
              x={point.x}
              y={point.y - 3}
              textAnchor="middle"
              fontSize="2"
              fill="#6b7280"
            >
              {point.value}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Подписи осей */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {data.map((item, index) => (
          <div key={index} className="text-center" style={{ width: `${width}%` }}>
            {item[xKey]}
          </div>
        ))}
      </div>
      
      {label && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          {label}
        </div>
      )}
    </div>
  );
};

export default LineChart;

