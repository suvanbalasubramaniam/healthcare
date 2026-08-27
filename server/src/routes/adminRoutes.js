import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);

export default router;