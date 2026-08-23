import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import { startMedicationReminderJob } from "./jobs/medicationReminderJob.js";
import { startEmailWorker } from "./jobs/emailWorker.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
};

startMedicationReminderJob();
startEmailWorker();
// Routes

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Healthcare Appointment API is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/doctors", doctorRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/visits", visitRoutes);

app.use("/api/prescriptions", prescriptionRoutes);
// 404 handler

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});


// Global error handler

app.use((error, req, res, next) => {
  console.error(error);

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues
    });
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message
  });
});




export default app;