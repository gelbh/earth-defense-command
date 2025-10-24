import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EventFeed = ({ events }) => {
  const isExpanded = true; // Always expanded in overlay mode
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
    <div className="p-4 flex-shrink-0 flex flex-col">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "350px" }}>
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
          events.slice(0, 5).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-2 rounded border-l-2 bg-black/20 ${getSeverityColor(event.severity)}`}
            >
              <div className="flex items-start space-x-1.5">
                <span className="text-sm flex-shrink-0">
                  {getSeverityIcon(event.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-bold text-white truncate">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0 ml-1">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-tight line-clamp-2">
                    {event.description}
                  </p>
                  {event.requiresAction && (
                    <div className="mt-1">
                      <span className="inline-block bg-neon-red text-black text-xs font-mono px-1.5 py-0.5 rounded">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Status */}
      {isExpanded && events.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neon-blue/30 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">MONITORING:</span>
            <span className="text-neon-green flex items-center">
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full mr-1.5 animate-pulse"></span>
              ACTIVE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFeed;
