import React from 'react';
import { motion } from 'framer-motion';

const EventFeed = ({ events }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'moderate': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '✅';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-neon-red border-neon-red';
      case 'moderate': return 'text-orange-500 border-orange-500';
      case 'low': return 'text-neon-yellow border-neon-yellow';
      default: return 'text-neon-green border-neon-green';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-medium-gray rounded-lg p-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white font-mono">📡 EVENT LOG</h3>
        <div className="text-xs text-gray-400 font-mono">
          {events.length} Events
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📡</div>
            <p className="text-gray-400 font-mono text-sm">
              No events detected
            </p>
            <p className="text-gray-500 font-mono text-xs">
              Monitoring space for threats...
            </p>
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border-l-4 bg-black/20 ${getSeverityColor(event.severity)}`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg flex-shrink-0">
                  {getSeverityIcon(event.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white truncate">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0 ml-2">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {event.description}
                  </p>
                  {event.requiresAction && (
                    <div className="mt-2">
                      <span className="inline-block bg-neon-red text-black text-xs font-mono px-2 py-1 rounded">
                        ACTION REQUIRED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* System Status */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400">SYSTEM STATUS:</span>
          <span className="text-neon-green flex items-center">
            <span className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse"></span>
            OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventFeed;
