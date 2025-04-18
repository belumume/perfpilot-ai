// dashboard.jsx
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js'; // Large dependency
import { DataGrid } from '@mui/x-data-grid'; // Another large dependency
import moment from 'moment'; // Unnecessary large date library

export default function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/dashboard-data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {data ? (
        <>
          <div className="chart-container">
            <canvas id="myChart"></canvas>
          </div>
          
          <div className="data-grid">
            <DataGrid rows={data.rows} columns={data.columns} />
          </div>
          
          <div className="timestamp">
            Last updated: {moment().format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
      
      {/* Inline script without next/script */}
      <script>
        {`
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('myChart');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Sales',
                  data: [12, 19, 3, 5, 2, 3]
                }]
              }
            });
          });
        `}
      </script>
    </div>
  );
}