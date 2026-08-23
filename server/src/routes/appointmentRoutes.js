import express from "express";

import {
  createAppointmentController,
  getPatientAppointmentsController,
  getDoctorAppointmentsController,
  cancelAppointmentController,
  getAppointmentByIdController,
  confirmAppointmentController,
  completeAppointmentController
} from "../controllers/appointmentController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("PATIENT"),
  createAppointmentController
);

router.get(
  "/patient",
  authenticate,
  authorizeRoles("PATIENT"),
  getPatientAppointmentsController
);

router.get(
  "/doctor",
  authenticate,
  authorizeRoles("DOCTOR"),
  getDoctorAppointmentsController
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("PATIENT"),
  getAppointmentByIdController
);

router.put(
  "/:id/cancel",
  authenticate,
  authorizeRoles("PATIENT"),
  cancelAppointmentController
);

router.put(
  "/:id/confirm",
  authenticate,
  authorizeRoles("DOCTOR"),
  confirmAppointmentController
);

router.put(
  "/:id/complete",
  authenticate,
  authorizeRoles("DOCTOR"),
  completeAppointmentController
);

export default router;