import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-900/95",
          border: "border-neon-green",
          icon: "✅",
          text: "text-neon-green",
        };
      case "error":
        return {
          bg: "bg-red-900/95",
          border: "border-neon-red",
          icon: "❌",
          text: "text-neon-red",
        };
      case "warning":
        return {
          bg: "bg-orange-900/95",
          border: "border-orange-500",
          icon: "⚠️",
          text: "text-orange-500",
        };
      default:
        return {
          bg: "bg-blue-900/95",
          border: "border-neon-blue",
          icon: "ℹ️",
          text: "text-neon-blue",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -20, x: "-50%" }}
        className={`fixed top-16 left-1/2 z-50 ${styles.bg} ${styles.border} border-2 rounded-lg shadow-2xl backdrop-blur-lg`}
        style={{ minWidth: "280px", maxWidth: "400px" }}
      >
        <div className="flex items-start gap-2 p-3">
          <span className="text-xl flex-shrink-0">{styles.icon}</span>
          <div className="flex-1">
            <div
              className={`font-mono text-xs ${styles.text} font-bold mb-0.5`}
            >
              {message.title ||
                (type === "success"
                  ? "Success"
                  : type === "error"
                  ? "Error"
                  : "Info")}
            </div>
            {message.description && (
              <div className="text-white text-xs font-mono leading-tight">
                {message.description}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
