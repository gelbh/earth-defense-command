import React from 'react';
import { motion } from 'framer-motion';

const CommandPanel = ({ children }) => {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-dark-gray rounded-2xl border border-neon-blue/30 p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neon-blue font-mono">
          🎮 COMMAND CENTER
        </h2>
        <div className="text-xs text-gray-400 font-mono">
          MISSION CONTROL
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        {children}
      </div>
    </motion.div>
  );
};

export default CommandPanel;
