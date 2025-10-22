import React from 'react';
import { motion } from 'framer-motion';

const CommandPanel = ({ children }) => {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-dark-gray rounded-xl border border-neon-blue/30 p-3 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-neon-blue font-mono">
          🎮 COMMAND CENTER
        </h2>
        <div className="text-xs text-gray-400 font-mono">
          MISSION CONTROL
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

export default CommandPanel;
