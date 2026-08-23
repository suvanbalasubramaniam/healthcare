import { Router } from "express";

import {
  createDoctorController,
  getDoctorsController,
  getDoctorController,
  updateDoctorController,
  getWorkingHoursController,
  setWorkingHoursController,
  updateWorkingHoursController,
  deleteWorkingHoursController,
  addLeaveController,
getLeavesController,
deleteLeaveController
} from "../controllers/doctorController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();


// ------------------------------------------------------------
// Public doctor search
// ------------------------------------------------------------

router.get("/", getDoctorsController);

// ------------------------------------------------------------
// Working hours
// ------------------------------------------------------------

router.get(
  "/:id/working-hours",
  getWorkingHoursController
);


router.post(
  "/:id/working-hours",
  authenticate,
  authorizeRoles("ADMIN"),
  setWorkingHoursController
);


router.put(
  "/:id/working-hours/:workingHoursId",
  authenticate,
  authorizeRoles("ADMIN"),
  updateWorkingHoursController
);


router.delete(
  "/:id/working-hours/:workingHoursId",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteWorkingHoursController
);

router.get("/:id", getDoctorController);

router.post(
  "/:id/leaves",
  authenticate,
  authorizeRoles("ADMIN"),
  addLeaveController
);

router.get(
  "/:id/leaves",
  authenticate,
  authorizeRoles("ADMIN", "DOCTOR"),
  getLeavesController
);

router.delete(
  "/:id/leaves/:leaveId",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteLeaveController
);


// ------------------------------------------------------------
// Admin doctor management
// ------------------------------------------------------------

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createDoctorController
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateDoctorController
);


export default router;