import {
  createPrescription,
  getVisitPrescriptions,
} from "../services/prescriptionService.js";

export const createPrescriptionController = async (req, res) => {
  try {
    const prescription = await createPrescription(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: {
        prescription,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVisitPrescriptionsController = async (req, res) => {
  try {
    const prescriptions = await getVisitPrescriptions(
      req.user.id,
      req.user.role,
      req.params.visitId
    );

    return res.status(200).json({
      success: true,
      data: {
        prescriptions,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};