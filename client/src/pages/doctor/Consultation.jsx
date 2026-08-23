import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SymptomSummary from "../../components/doctor/SymptomSummary";
import VisitNotesForm from "../../components/doctor/VisitNotesForm";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

import { getDoctorAppointments } from "../../services/doctorService";
import { createVisit } from "../../services/visitService";
import { getVisitPrescriptions } from "../../services/prescriptionService";

const Consultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getDoctorAppointments();

        const appointments =
          result?.appointments ||
          result?.data?.appointments ||
          result ||
          [];

        const found = appointments.find(
          (item) => item.id === appointmentId
        );

        console.log("🔥 CONSULTATION APPOINTMENT:", found);
        console.log("🔥 SYMPTOMS:", found?.symptoms);
        console.log("🔥 PRE-VISIT SUMMARY:", found?.preVisitSummary);
        console.log("🔥 VISIT:", found?.visit);

        if (!found) {
          setError("Appointment not found.");
          return;
        }

        setAppointment(found);

        /*
         * If the appointment already has a visit,
         * fetch its prescriptions using the visit ID.
         */
        if (found.visit?.id) {
          setPrescriptionLoading(true);

          try {
            const prescriptionResult =
              await getVisitPrescriptions(found.visit.id);

            console.log(
              "🔥 PRESCRIPTION API RESULT:",
              prescriptionResult
            );

            /*
             * getVisitPrescriptions() already returns:
             *
             * response.data.data.prescriptions
             *
             * Therefore prescriptionResult is already
             * the prescriptions array.
             */
            const fetchedPrescriptions =
              Array.isArray(prescriptionResult)
                ? prescriptionResult
                : [];

            console.log(
              "🔥 FETCHED PRESCRIPTIONS:",
              fetchedPrescriptions
            );

            setPrescriptions(fetchedPrescriptions);
          } catch (prescriptionError) {
            console.error(
              "❌ FAILED TO LOAD PRESCRIPTIONS:",
              prescriptionError
            );

            setPrescriptions([]);
          } finally {
            setPrescriptionLoading(false);
          }
        } else {
          setPrescriptions([]);
        }
      } catch (err) {
        console.error("❌ FAILED TO LOAD APPOINTMENT:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load appointment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [appointmentId]);

  const handleSubmit = async (visitData) => {
    try {
      setSaving(true);
      setError("");

      console.log("🔥 SAVING VISIT:", visitData);

      const result = await createVisit(visitData);

      console.log("✅ Visit created:", result);

      alert("Consultation saved successfully!");

      navigate("/doctor");
    } catch (err) {
      console.error("❌ CREATE VISIT FAILED:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save consultation."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="page-container consultation-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <h1>Patient Consultation</h1>

          <p>
            Review the patient's information and record the
            consultation.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/doctor")}
        >
          Back to Appointments
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* =====================================================
          SYMPTOMS + VISIT NOTES
      ====================================================== */}

      <div className="consultation-grid">

        <div>
          <SymptomSummary
            appointment={appointment}
          />
        </div>

        <div>
          <VisitNotesForm
            appointment={appointment}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </div>

      </div>

      {/* =====================================================
          PRESCRIPTIONS
      ====================================================== */}

      <div
        style={{
          marginTop: "30px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
        }}
      >

        <h2
          style={{
            marginBottom: "20px",
            fontSize: "28px",
          }}
        >
          Prescriptions
        </h2>

        {/* Loading */}

        {prescriptionLoading && (
          <p style={{ color: "#666" }}>
            Loading prescriptions...
          </p>
        )}

        {/* No prescriptions */}

        {!prescriptionLoading &&
          prescriptions.length === 0 && (
            <p style={{ color: "#666" }}>
              No prescriptions have been added for this
              consultation.
            </p>
          )}

        {/* Prescriptions */}

        {!prescriptionLoading &&
          prescriptions.length > 0 &&
          prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              style={{
                background: "#f8f9fb",
                padding: "22px",
                borderRadius: "10px",
                marginBottom: "18px",
                border: "1px solid #e5e7eb",
              }}
            >

              <h3
                style={{
                  fontSize: "22px",
                  marginBottom: "15px",
                }}
              >
                {prescription.medicationName}
              </h3>

              <p>
                <strong>Dosage:</strong>{" "}
                {prescription.dosage}
              </p>

              <p>
                <strong>Frequency:</strong>{" "}
                {prescription.frequency}
              </p>

              {prescription.duration && (
                <p>
                  <strong>Duration:</strong>{" "}
                  {prescription.duration}
                </p>
              )}

              {prescription.instructions && (
                <p>
                  <strong>Instructions:</strong>{" "}
                  {prescription.instructions}
                </p>
              )}

              {/* Medication reminder */}

              {prescription.medications?.length > 0 && (
                <div
                  style={{
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  <strong>
                    Medication Reminder
                  </strong>

                  {prescription.medications.map(
                    (medication) => (
                      <p
                        key={medication.id}
                        style={{
                          marginTop: "8px",
                          color: "#555",
                        }}
                      >
                        Status:{" "}
                        {medication.reminderStatus}
                      </p>
                    )
                  )}
                </div>
              )}

            </div>
          ))}

      </div>

    </div>
  );
};

export default Consultation;