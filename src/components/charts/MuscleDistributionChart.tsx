import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { MuscleGroupVolume } from '../../engines/statisticsEngine';

interface MuscleDistributionChartProps {
  data: MuscleGroupVolume[];
}

const COLORS = ['#FF806B', '#E9AB87', '#B4F34C', '#6AF8D5', '#38BDF8', '#A78BFA', '#F472B6'];

export const MuscleDistributionChart: React.FC<MuscleDistributionChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.sets > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-4">
        <p className="text-sm font-bold text-[#F5F6F5]">부위별 완료 기록이 없습니다.</p>
        <p className="text-xs text-[#A9B2AC] mt-1">운동을 완료하면 자극받은 근육 부위의 세트 비중이 분석됩니다.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as MuscleGroupVolume;
      return (
        <div className="bg-[#1D211E] border border-[#363D36] p-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-[#F5F6F5] mb-1">{p.groupLabel}</p>
          <p className="text-[#B4F34C] font-extrabold">완료 세트: {p.sets}세트</p>
          <p className="text-[#A9B2AC]">총 볼륨: {Math.round(p.volumeKg).toLocaleString()} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#252B27" horizontal={false} />
          <XAxis
            type="number"
            stroke="#A9B2AC"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#363D36' }}
          />
          <YAxis
            type="category"
            dataKey="groupLabel"
            stroke="#A9B2AC"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#363D36' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="sets" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
