import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor
} from "../services/doctorService.js";

import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorSearchSchema
} from "../validators/doctorValidator.js";

import {
  addLeave,
  getLeaves,
  deleteLeave
} from "../services/leaveService.js";

import {
  getWorkingHours,
  setWorkingHours,
  updateWorkingHours,
  deleteWorkingHours
} from "../services/doctorService.js";

import {
  workingHoursSchema,
  workingHoursUpdateSchema
} from "../validators/doctorValidator.js";

export const createDoctorController = async (req, res, next) => {
  try {
    const validatedData = createDoctorSchema.parse(req.body);

    const doctor = await createDoctor(validatedData);

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getDoctorsController = async (req, res, next) => {
  try {
    const { specialization } = doctorSearchSchema.parse(req.query);

    const doctors = await getDoctors({
      specialization
    });

    res.status(200).json({
      success: true,
      data: {
        doctors
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getDoctorController = async (req, res, next) => {
  try {
    const doctor = await getDoctorById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};


export const updateDoctorController = async (req, res, next) => {
  try {
    const validatedData = updateDoctorSchema.parse(req.body);

    const doctor = await updateDoctor(
      req.params.id,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: {
        doctor
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkingHoursController = async (
  req,
  res,
  next
) => {
  try {
    const workingHours = await getWorkingHours(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: {
        workingHours
      }
    });
  } catch (error) {
    next(error);
  }
};


export const setWorkingHoursController = async (
  req,
  res,
  next
) => {
  try {
    const data = workingHoursSchema.parse(req.body);

    const workingHours = await setWorkingHours(
      req.params.id,
      data
    );

    res.status(201).json({
      success: true,
      message: "Working hours added successfully",
      data: {
        workingHours
      }
    });
  } catch (error) {
    next(error);
  }
};


export const updateWorkingHoursController = async (
  req,
  res,
  next
) => {
  try {
    const data = workingHoursUpdateSchema.parse(
      req.body
    );

    const workingHours = await updateWorkingHours(
      req.params.id,
      req.params.workingHoursId,
      data
    );

    res.status(200).json({
      success: true,
      message: "Working hours updated successfully",
      data: {
        workingHours
      }
    });
  } catch (error) {
    next(error);
  }
};


export const deleteWorkingHoursController = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteWorkingHours(
      req.params.id,
      req.params.workingHoursId
    );

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const addLeaveController = async (req, res) => {
  try {
    const { id: doctorId } = req.params;

    const leave = await addLeave(doctorId, req.body);

    return res.status(201).json({
      success: true,
      message: "Leave added successfully",
      data: {
        leave
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

export const getLeavesController = async (req, res) => {
  try {
    const { id: doctorId } = req.params;

    const leaves = await getLeaves(doctorId);

    return res.status(200).json({
      success: true,
      data: {
        leaves
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaves"
    });
  }
};

export const deleteLeaveController = async (req, res) => {
  try {
    const { id: doctorId, leaveId } = req.params;

    await deleteLeave(doctorId, leaveId);

    return res.status(200).json({
      success: true,
      message: "Leave deleted successfully"
    });
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};