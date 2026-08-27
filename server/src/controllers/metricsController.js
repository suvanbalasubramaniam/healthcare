import { getSystemMetrics } from "../services/metricsService.js";

export const getMetricsController = async (req, res, next) => {
  try {
    const metrics = await getSystemMetrics();

    res.status(200).json({
      success: true,
      data: {
        metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};