import {
  createVisit,
  getDoctorVisits,
  getPatientVisits,
  getVisitById
} from "../services/visitService.js";

export const createVisitController = async (req, res) => {
  try {
    const visit = await createVisit(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Visit created successfully",
      data: {
        visit
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDoctorVisitsController = async (req, res) => {
  try {
    const visits = await getDoctorVisits(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        visits
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPatientVisitsController = async (req, res) => {
  try {
    const visits = await getPatientVisits(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        visits
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getVisitByIdController = async (req, res) => {
  try {
    const visit = await getVisitById(
      req.user.id,
      req.user.role,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: {
        visit
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};