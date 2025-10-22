import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './SizeDistribution.css';

const COLORS = {
  'Small (< 1.5 R⊕)': '#3498db',
  'Medium (1.5-2.5 R⊕)': '#16a085',
  'Large (2.5-6 R⊕)': '#f39c12',
  'Giant (> 6 R⊕)': '#e94560',
  'Unknown': '#95a5a6'
};

const SizeDistribution = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSizeData();
  }, []);

  const fetchSizeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/stats/sizes');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load size distribution');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="chart-loading">Loading size distribution...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  return (
    <div className="chart-container">
      <h2 className="chart-title">Exoplanet Size Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="category"
            stroke="#ccc"
            tick={{ fill: '#ccc', fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#ccc"
            tick={{ fill: '#ccc' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#ccc' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #0f3460',
              borderRadius: '8px',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(233, 69, 96, 0.1)' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#e94560'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SizeDistribution;
