import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DiscoveryTimeline.css';

const DiscoveryTimeline = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/stats/timeline');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load discovery timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="chart-loading">Loading timeline...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  return (
    <div className="chart-container">
      <h2 className="chart-title">Exoplanet Discoveries Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="year"
            stroke="#ccc"
            tick={{ fill: '#ccc' }}
          />
          <YAxis
            stroke="#ccc"
            tick={{ fill: '#ccc' }}
            label={{ value: 'Discoveries', angle: -90, position: 'insideLeft', fill: '#ccc' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #0f3460',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelStyle={{ color: '#e94560' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#e94560"
            strokeWidth={2}
            dot={{ fill: '#e94560', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiscoveryTimeline;
