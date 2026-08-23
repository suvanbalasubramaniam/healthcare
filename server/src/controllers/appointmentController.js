import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getAppointmentById,
  confirmAppointment,
  completeAppointment

} from "../services/appointmentService.js";

export const createAppointmentController = async (req, res) => {
  try {
    const appointment = await createAppointment(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: {
        appointment
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

export const getPatientAppointmentsController = async (req, res) => {
  try {
    const appointments = await getPatientAppointments(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        appointments
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

export const getDoctorAppointmentsController = async (req, res) => {
  try {
    const appointments = await getDoctorAppointments(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        appointments
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

export const cancelAppointmentController = async (req, res) => {
  try {
    const appointment = await cancelAppointment(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: {
        appointment
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



export const getAppointmentByIdController = async (req, res) => {
  try {
    const appointment = await getAppointmentById(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: {
        appointment
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

export const confirmAppointmentController = async (req, res) => {
  try {
    const appointment = await confirmAppointment(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      data: {
        appointment
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

export const completeAppointmentController = async (req, res) => {
  try {
    const appointment = await completeAppointment(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Appointment completed successfully",
      data: {
        appointment
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