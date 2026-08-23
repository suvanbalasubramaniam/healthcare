import api from "./api";

// ==============================
// CREATE VISIT - DOCTOR
// ==============================

export const createVisit = async (visitData) => {
  const response = await api.post(
    "/visits",
    visitData
  );

  return response.data?.data?.visit;
};


// ==============================
// GET DOCTOR VISITS
// ==============================

export const getDoctorVisits = async () => {
  const response = await api.get(
    "/visits/doctor"
  );

  return response.data?.data?.visits || [];
};


// ==============================
// GET PATIENT VISITS
// ==============================

export const getPatientVisits = async () => {
  const response = await api.get(
    "/visits/patient"
  );

  return response.data?.data?.visits || [];
};


// ==============================
// GET SINGLE VISIT
// ==============================

export const getVisitById = async (visitId) => {
  const response = await api.get(
    `/visits/${visitId}`
  );

  return response.data?.data?.visit;
};