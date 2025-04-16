"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface CategoryBarChartProps {
  categories: Record<string, number>;
}

const CategoryBarChart = ({ categories }: CategoryBarChartProps) => {
  // Transform the category data for the bar chart
  const barData = Object.entries(categories).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    issues: count
  })).sort((a, b) => b.issues - a.issues); // Sort by issues count descending

  // If there are no categories, show a placeholder message
  if (barData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-muted-foreground">No issues detected</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={barData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 5,
        }}
        barSize={36}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#888' }}
          axisLine={{ stroke: '#555' }}
        />
        <YAxis 
          tick={{ fill: '#888' }}
          axisLine={{ stroke: '#555' }}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: 'none', borderRadius: '6px', padding: '8px 12px' }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 'bold', marginBottom: '4px' }}
          formatter={(value) => [`${value} issue${value !== 1 ? 's' : ''}`, '']}
        />
        <Legend />
        <Bar 
          dataKey="issues" 
          name="Issues" 
          fill="#4f46e5" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryBarChart; 