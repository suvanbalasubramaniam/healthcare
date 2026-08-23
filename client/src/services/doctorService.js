import api from "./api";

export const getDoctors = async () => {
  const response = await api.get("/doctors");

  return response.data?.data;
};

export const getDoctorById = async (doctorId) => {
  const response = await api.get(`/doctors/${doctorId}`);

  return response.data?.data?.doctor;
};

export const getDoctorAppointments = async () => {
  const response = await api.get("/appointments/doctor");

  return response.data?.data?.appointments || [];
};

export const confirmAppointment = async (appointmentId) => {
  const response = await api.put(
    `/appointments/${appointmentId}/confirm`
  );

  return response.data?.data?.appointment;
};

export const getDoctorProfile = async () => {
  const response = await api.get("/doctors/me");

  return response.data?.data;
};

export const getAppointmentById = async (appointmentId) => {
  const response = await api.get(
    `/appointments/${appointmentId}`
  );

  return response.data?.data?.appointment;
};