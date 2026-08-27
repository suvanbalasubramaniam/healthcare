import express from "express";
import { getMetricsController } from "../controllers/metricsController.js";

const router = express.Router();

router.get("/", getMetricsController);

export default router;