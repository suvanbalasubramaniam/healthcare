import api from "./api";

// ============================================================
// CREATE APPOINTMENT
// ============================================================

export const createAppointment = async (appointmentData) => {
  const response = await api.post(
    "/appointments",
    appointmentData
  );

  return response.data?.data?.appointment;
};


// ============================================================
// GET LOGGED-IN PATIENT'S APPOINTMENTS
// ============================================================

export const getPatientAppointments = async () => {
  const response = await api.get(
    "/appointments/patient"
  );

  return response.data?.data?.appointments || [];
};


// ============================================================
// GET LOGGED-IN DOCTOR'S APPOINTMENTS
// ============================================================

export const getDoctorAppointments = async () => {
  const response = await api.get(
    "/appointments/doctor"
  );

  return response.data?.data?.appointments || [];
};


// ============================================================
// GET APPOINTMENT BY ID
// ============================================================

export const getAppointmentById = async (
  appointmentId
) => {
  const response = await api.get(
    `/appointments/${appointmentId}`
  );

  return response.data?.data?.appointment;
};


// ============================================================
// CANCEL APPOINTMENT
// ============================================================

export const cancelAppointment = async (
  appointmentId
) => {
  const response = await api.put(
    `/appointments/${appointmentId}/cancel`
  );

  return response.data?.data?.appointment;
};


// ============================================================
// CONFIRM APPOINTMENT
// ============================================================

export const confirmAppointment = async (
  appointmentId
) => {
  const response = await api.put(
    `/appointments/${appointmentId}/confirm`
  );

  return response.data?.data?.appointment;
};


// ============================================================
// COMPLETE APPOINTMENT
// ============================================================

export const completeAppointment = async (
  appointmentId
) => {
  const response = await api.put(
    `/appointments/${appointmentId}/complete`
  );

  return response.data?.data?.appointment;
};