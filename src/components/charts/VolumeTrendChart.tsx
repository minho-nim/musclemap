import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { VolumeByDay } from '../../engines/statisticsEngine';

interface VolumeTrendChartProps {
  data: VolumeByDay[];
}

export const VolumeTrendChart: React.FC<VolumeTrendChartProps> = ({ data }) => {
  const hasData = data.some((d) => d.volumeKg > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-4">
        <p className="text-sm font-bold text-[#F5F6F5]">해당 기간에 기록된 운동 볼륨이 없습니다.</p>
        <p className="text-xs text-[#A9B2AC] mt-1">운동을 완료하면 일자별 총 중량 변화가 기록됩니다.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as VolumeByDay;
      return (
        <div className="bg-[#1D211E] border border-[#363D36] p-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-[#F5F6F5] mb-1">{p.date}</p>
          <p className="text-[#B4F34C] font-extrabold">
            볼륨: {Math.round(p.volumeKg).toLocaleString()} kg
          </p>
          <p className="text-[#A9B2AC]">완료 세트: {p.setsCount}세트</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252B27" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            stroke="#A9B2AC"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#363D36' }}
          />
          <YAxis
            stroke="#A9B2AC"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#363D36' }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volumeKg" fill="#B4F34C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
