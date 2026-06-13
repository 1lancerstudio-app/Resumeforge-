'use client';

import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface SkillData {
  name: string;
  value: number;
  fullMark: 100;
}

interface RadarChartProps {
  data: SkillData[];
  title?: string;
  color?: string;
}

export function SkillRadarChart({ data, title, color = '#E8FF00' }: RadarChartProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255, 255, 255, 0.5)' }} />
          <Radar
            name={title}
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.6}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
          {/* <Legend /> */}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
