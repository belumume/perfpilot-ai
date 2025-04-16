"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

interface ScoreAreaChartProps {
  score: number;
}

const ScoreAreaChart = ({ score }: ScoreAreaChartProps) => {
  // Generate data for the chart
  // We'll create a bell curve around the score
  const generateDataPoints = () => {
    const data = [];
    const range = 100; // Full range from 0-100
    const step = 5; // Step size for X-axis
    
    for (let i = 0; i <= range; i += step) {
      // For scores below the current score, increase gradually
      // For scores above the current score, decrease gradually
      let height;
      if (i <= score) {
        height = (i / score) * 100;
      } else {
        height = Math.max(0, 100 - (((i - score) / (100 - score)) * 100));
      }
      
      // Determine the zone (poor, moderate, good, excellent)
      let zone;
      if (i < 40) zone = "Poor";
      else if (i < 60) zone = "Needs Improvement";
      else if (i < 75) zone = "Moderate";
      else if (i < 90) zone = "Good";
      else zone = "Excellent";
      
      data.push({
        score: i,
        value: height,
        zone
      });
    }
    
    return data;
  };
  
  const data = generateDataPoints();
  
  // Get color based on score
  const getScoreColor = () => {
    if (score >= 90) return "#22c55e"; // Green
    if (score >= 75) return "#84cc16"; // Yellow-green
    if (score >= 60) return "#eab308"; // Yellow
    if (score >= 40) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
        <XAxis 
          dataKey="score" 
          tick={{ fill: '#888' }}
          axisLine={{ stroke: '#555' }}
          domain={[0, 100]}
          label={{ value: 'Performance Score', position: 'insideBottom', offset: -5, fill: '#888' }}
        />
        <YAxis 
          tick={{ fill: '#888' }}
          axisLine={{ stroke: '#555' }}
          domain={[0, 100]}
          hide
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: 'none', borderRadius: '6px', padding: '8px 12px' }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 'bold', marginBottom: '4px' }}
          formatter={(value, name, props) => [props.payload.zone, 'Zone']}
          labelFormatter={(value) => `Score: ${value}`}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="40%" stopColor="#f97316" stopOpacity={0.8} />
            <stop offset="60%" stopColor="#eab308" stopOpacity={0.8} />
            <stop offset="75%" stopColor="#84cc16" stopOpacity={0.8} />
            <stop offset="90%" stopColor="#22c55e" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          fill="url(#scoreGradient)" 
          stroke={getScoreColor()}
          strokeWidth={2}
        />
        <ReferenceLine 
          x={score} 
          stroke={getScoreColor()} 
          strokeWidth={2} 
          strokeDasharray="3 3"
          label={{ 
            value: `Your Score: ${score}`, 
            position: 'top', 
            fill: getScoreColor(),
            fontSize: 12,
            fontWeight: 'bold'
          }} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ScoreAreaChart; 