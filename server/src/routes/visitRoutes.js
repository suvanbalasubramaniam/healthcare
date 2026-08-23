import express from "express";

import {
  createVisitController,
  getDoctorVisitsController,
  getPatientVisitsController,
  getVisitByIdController
} from "../controllers/visitController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("DOCTOR"),
  createVisitController
);

router.get(
  "/doctor",
  authenticate,
  authorizeRoles("DOCTOR"),
  getDoctorVisitsController
);

router.get(
  "/patient",
  authenticate,
  authorizeRoles("PATIENT"),
  getPatientVisitsController
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("DOCTOR", "PATIENT"),
  getVisitByIdController
);

export default router;