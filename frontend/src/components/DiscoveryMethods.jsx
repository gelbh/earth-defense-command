import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './DiscoveryMethods.css';

const COLORS = ['#e94560', '#0f3460', '#16a085', '#f39c12', '#9b59b6', '#3498db', '#e67e22'];

const DiscoveryMethods = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMethodsData();
  }, []);

  const fetchMethodsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/stats/methods');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load discovery methods');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="chart-loading">Loading methods...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  const renderCustomLabel = ({ method, percent }) => {
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">Discovery Methods</h2>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            nameKey="method"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #0f3460',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px'
            }}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#ccc' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiscoveryMethods;
