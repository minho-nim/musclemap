import React from 'react';

export interface RadarCategoryData {
  category: string;
  nameKo: string;
  score: number; // 0 - 100
}

interface RadarBalanceChartProps {
  data: RadarCategoryData[];
}

export const RadarBalanceChart: React.FC<RadarBalanceChartProps> = ({ data }) => {
  // 6 radial spokes
  const count = data.length || 6;
  const size = 320;
  const center = size / 2;
  const radius = 100;

  const getCoordinates = (index: number, valueRatio: number) => {
    // Start from top (-90 degrees)
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build grid rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for user's actual balance data
  const polygonPoints = data
    .map((item, idx) => {
      const ratio = Math.max(0.15, Math.min(1.0, (item.score || 20) / 100));
      const pt = getCoordinates(idx, ratio);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[300px] h-auto overflow-visible"
      >
        {/* Concentric polygon web rings */}
        {rings.map((ringRatio, rIdx) => {
          const ringPoints = Array.from({ length: count })
            .map((_, idx) => {
              const pt = getCoordinates(idx, ringRatio);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');

          return (
            <polygon
              key={rIdx}
              points={ringPoints}
              fill={rIdx === rings.length - 1 ? '#26282E' : 'none'}
              stroke="#3E4048"
              strokeWidth="1"
              strokeDasharray={rIdx === rings.length - 1 ? 'none' : '3,3'}
            />
          );
        })}

        {/* Radial Axis Lines */}
        {Array.from({ length: count }).map((_, idx) => {
          const pt = getCoordinates(idx, 1.0);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="#3E4048"
              strokeWidth="1"
            />
          );
        })}

        {/* User Balance Data Polygon (Planfit Green translucent fill) */}
        <polygon
          points={polygonPoints}
          fill="#B4F34C"
          fillOpacity="0.25"
          stroke="#B4F34C"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Data Vertices */}
        {data.map((item, idx) => {
          const ratio = Math.max(0.15, Math.min(1.0, (item.score || 20) / 100));
          const pt = getCoordinates(idx, ratio);
          return (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#1B1C20"
              stroke="#B4F34C"
              strokeWidth="2"
            />
          );
        })}

        {/* Spoke Labels: Category & Percentage */}
        {data.map((item, idx) => {
          const pt = getCoordinates(idx, 1.28);
          return (
            <g key={idx} className="text-center font-sans">
              <text
                x={pt.x}
                y={pt.y - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[#F4F4F5] text-[12px] font-bold"
              >
                {item.nameKo}
              </text>
              <text
                x={pt.x}
                y={pt.y + 11}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[#A9AAB3] text-[10px] font-medium"
              >
                {item.score}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
