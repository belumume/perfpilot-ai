"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

interface IssuePieChartProps {
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
}

const IssuePieChart = ({ criticalIssues, warningIssues, infoIssues }: IssuePieChartProps) => {
  const data = [
    { name: 'Critical', value: criticalIssues, color: '#ef4444' },  // Red
    { name: 'Warning', value: warningIssues, color: '#f59e0b' },   // Amber
    { name: 'Info', value: infoIssues, color: '#3b82f6' }           // Blue
  ].filter(item => item.value > 0);  // Only include non-zero values

  // If there are no issues, show "No issues" slice
  if (data.length === 0) {
    data.push({ name: 'No issues', value: 1, color: '#22c55e' });  // Green
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} issue${value !== 1 ? 's' : ''}`, '']}
          contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: 'none', borderRadius: '6px', padding: '8px 12px' }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default IssuePieChart; 