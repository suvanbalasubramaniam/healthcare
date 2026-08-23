import api from "./api";

// Create appointment
export const createAppointment = async (appointmentData) => {
  const response = await api.post(
    "/appointments",
    appointmentData
  );

  return response.data?.data?.appointment;
};

// Get logged-in patient's appointments


// Get logged-in doctor's appointments
export const getDoctorAppointments = async () => {
  const response = await api.get(
    "/appointments/doctor"
  );

  return response.data?.data?.appointments || [];
};

// Get appointment by ID


// Cancel appointment

export const getPatientAppointments = async () => {
  const response = await api.get("/appointments/patient");

  return response.data?.data?.appointments || [];
};

export const cancelAppointment = async (appointmentId) => {
  const response = await api.put(
    `/appointments/${appointmentId}/cancel`
  );

  return response.data?.data?.appointment;
};