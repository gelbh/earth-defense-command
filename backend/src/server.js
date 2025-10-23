import "./config/env.js"; // Load environment variables FIRST
import express from "express";
import cors from "cors";
import eventRoutes from "./routes/events.js";
import neoRoutes from "./routes/neo.js";
import levelRoutes from "./routes/levels.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Earth Defense Command API is running",
    version: "1.0.0",
    endpoints: {
      events: "/api/events",
      neo: "/api/neo",
      levels: "/api/levels",
    },
  });
});

// Game API routes
app.use("/api/events", eventRoutes);
app.use("/api/neo", neoRoutes);
app.use("/api/levels", levelRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
