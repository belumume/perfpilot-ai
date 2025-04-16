"use client";

import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface CategoryRadarChartProps {
  categories: Record<string, number>;
}

const CategoryRadarChart = ({ categories }: CategoryRadarChartProps) => {
  // Transform the category data for the radar chart
  const radarData = Object.entries(categories).map(([category, count]) => {
    // Invert the score - fewer issues means better performance
    // 100 is perfect (no issues), 0 is worst
    const score = Math.max(0, 100 - count * 20);
    
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      score: score
    };
  });

  // If there are no categories, show a perfect score in all default categories
  if (radarData.length === 0) {
    const defaultCategories = ['images', 'rendering', 'imports', 'fonts', 'scripts', 'components'];
    defaultCategories.forEach(category => {
      radarData.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        score: 100
      });
    });
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
        <PolarGrid stroke="#666" />
        <PolarAngleAxis dataKey="category" stroke="#888" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
        <Radar
          name="Performance Score"
          dataKey="score"
          stroke="#4f46e5"
          fill="#4f46e5"
          fillOpacity={0.6}
        />
        <Tooltip 
          formatter={(value: number) => [`${value}%`, 'Score']}
          contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: 'none', borderRadius: '6px', padding: '8px 12px' }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default CategoryRadarChart; 