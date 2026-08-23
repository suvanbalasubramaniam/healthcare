import api from "./api";

export const createPrescription = async (data) => {
  const response = await api.post(
    "/prescriptions",
    data
  );

  return response.data.data.prescription;
};

export const getVisitPrescriptions = async (visitId) => {
  const response = await api.get(
    `/prescriptions/visit/${visitId}`
  );

  return response.data.data.prescriptions;
};