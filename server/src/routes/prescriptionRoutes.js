import express from "express";

import {
  createPrescriptionController,
  getVisitPrescriptionsController,
} from "../controllers/prescriptionController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  createPrescriptionController
);

router.get(
  "/visit/:visitId",
  authenticate,
  getVisitPrescriptionsController
);

export default router;