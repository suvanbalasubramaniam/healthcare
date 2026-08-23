import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPatientAppointments,
  cancelAppointment,
} from "../../services/appointmentService";

import {
  getPatientVisits,
} from "../../services/visitService";


const PatientAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==============================
  // LOAD APPOINTMENTS + VISITS
  // ==============================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("=================================");
      console.log("FETCHING PATIENT DATA");
      console.log("=================================");

      const [
        appointmentList,
        visitList,
      ] = await Promise.all([
        getPatientAppointments(),
        getPatientVisits(),
      ]);

      console.log(
        "PATIENT APPOINTMENTS:",
        appointmentList
      );

      console.log(
        "PATIENT VISITS:",
        visitList
      );

      setAppointments(
        Array.isArray(appointmentList)
          ? appointmentList
          : []
      );

      setVisits(
        Array.isArray(visitList)
          ? visitList
          : []
      );

    } catch (err) {
      console.error(
        "FAILED TO LOAD PATIENT DATA:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Unable to load appointments."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ==============================
  // FIND VISIT FOR APPOINTMENT
  // ==============================

  const getVisitForAppointment = (
    appointmentId
  ) => {
    return visits.find(
      (visit) =>
        visit.appointmentId === appointmentId
    );
  };


  // ==============================
  // CANCEL APPOINTMENT
  // ==============================

  const handleCancel = async (
    appointmentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log(
        "CANCELLING APPOINTMENT:",
        appointmentId
      );

      await cancelAppointment(
        appointmentId
      );

      console.log(
        "APPOINTMENT CANCELLED SUCCESSFULLY"
      );

      await loadData();

    } catch (err) {
      console.error(
        "FAILED TO CANCEL APPOINTMENT:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to cancel appointment."
      );
    }
  };


  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==============================
  // FORMAT TIME
  // ==============================

  const formatTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // ==============================
  // DOCTOR NAME
  // ==============================

  const getDoctorName = (
    appointment
  ) => {
    const user =
      appointment.doctor?.user;

    if (!user) {
      return "Doctor";
    }

    const firstName =
      user.firstName || "";

    const lastName =
      user.lastName || "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName
      ? `Dr. ${fullName}`
      : "Doctor";
  };


  // ==============================
  // SPECIALIZATION
  // ==============================

  const getSpecialization = (
    appointment
  ) => {
    return (
      appointment.doctor
        ?.doctorProfile
        ?.specialization ||
      "Doctor"
    );
  };


  // ==============================
  // STATUS STYLE
  // ==============================

  const getStatusStyle = (
    status
  ) => {
    const normalizedStatus =
      status?.toUpperCase();

    if (
      normalizedStatus ===
      "CONFIRMED"
    ) {
      return {
        background: "#e8f5e9",
        color: "#2e7d32",
      };
    }

    if (
      normalizedStatus ===
      "CANCELLED"
    ) {
      return {
        background: "#ffebee",
        color: "#c62828",
      };
    }

    if (
      normalizedStatus ===
      "COMPLETED"
    ) {
      return {
        background: "#e3f2fd",
        color: "#1565c0",
      };
    }

    return {
      background: "#fff3e0",
      color: "#ef6c00",
    };
  };


  // ==============================
  // PAGE
  // ==============================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 60px",
      }}
    >

      {/* ==========================
          HEADER
      ========================== */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              color: "#172033",
            }}
          >
            My Appointments
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "18px",
              marginTop: "8px",
            }}
          >
            View your upcoming and previous
            appointments.
          </p>

        </div>


        <button
          onClick={() =>
            navigate("/patient")
          }
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Back to Dashboard
        </button>

      </header>


      {/* ==========================
          LOADING
      ========================== */}

      {loading && (
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
          }}
        >
          <p>
            Loading appointments...
          </p>
        </div>
      )}


      {/* ==========================
          ERROR
      ========================== */}

      {!loading && error && (
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
          }}
        >

          <h2>
            Something went wrong
          </h2>

          <p
            style={{
              color: "red",
            }}
          >
            {error}
          </p>

          <button
            onClick={loadData}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>

        </div>
      )}


      {/* ==========================
          NO APPOINTMENTS
      ========================== */}

      {!loading &&
        !error &&
        appointments.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >

            <h2>
              No appointments
            </h2>

            <p
              style={{
                color: "#666",
              }}
            >
              You don't have any
              appointments yet.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/patient/doctors"
                )
              }
              style={{
                marginTop: "15px",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Find a Doctor
            </button>

          </div>
        )}


      {/* ==========================
          APPOINTMENT CARDS
      ========================== */}

      {!loading &&
        !error &&
        appointments.length > 0 && (

          <div
            style={{
              display: "grid",
              gap: "20px",
              maxWidth: "900px",
            }}
          >

            {appointments.map(
              (appointment) => {

                const status =
                  appointment.status?.toUpperCase();

                const statusStyle =
                  getStatusStyle(
                    appointment.status
                  );

                const canCancel =
                  status !== "CANCELLED" &&
                  status !== "COMPLETED";


                // Find saved consultation
                const visit =
                  getVisitForAppointment(
                    appointment.id
                  );


                return (

                  <div
                    key={appointment.id}
                    style={{
                      background: "#ffffff",
                      padding: "25px",
                      borderRadius: "12px",
                      border:
                        "1px solid #e5e7eb",
                    }}
                  >

                    {/* ======================
                        DOCTOR + STATUS
                    ====================== */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        marginBottom:
                          "20px",
                      }}
                    >

                      <div>

                        <h2
                          style={{
                            margin: 0,
                            color: "#172033",
                          }}
                        >
                          {getDoctorName(
                            appointment
                          )}
                        </h2>

                        <p
                          style={{
                            color: "#2563eb",
                            fontWeight: "600",
                            marginTop: "6px",
                          }}
                        >
                          {getSpecialization(
                            appointment
                          )}
                        </p>

                      </div>


                      <span
                        style={{
                          padding:
                            "6px 12px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "14px",
                          fontWeight:
                            "600",
                          ...statusStyle,
                        }}
                      >
                        {appointment.status ||
                          "SCHEDULED"}
                      </span>

                    </div>


                    {/* ======================
                        DATE + TIME
                    ====================== */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                      }}
                    >

                      <div>

                        <strong>
                          Date
                        </strong>

                        <p
                          style={{
                            color: "#666",
                            marginTop: "5px",
                          }}
                        >
                          {formatDate(
                            appointment.startTime
                          )}
                        </p>

                      </div>


                      <div>

                        <strong>
                          Time
                        </strong>

                        <p
                          style={{
                            color: "#666",
                            marginTop: "5px",
                          }}
                        >
                          {formatTime(
                            appointment.startTime
                          )}{" "}
                          -{" "}
                          {formatTime(
                            appointment.endTime
                          )}
                        </p>

                      </div>

                    </div>


                    {/* ======================
                        SYMPTOMS
                    ====================== */}

                    {appointment.symptoms && (

                      <div
                        style={{
                          marginTop: "15px",
                          paddingTop: "15px",
                          borderTop:
                            "1px solid #eee",
                        }}
                      >

                        <strong>
                          Symptoms
                        </strong>

                        <p
                          style={{
                            color: "#666",
                            lineHeight: "1.5",
                            marginBottom: 0,
                          }}
                        >
                          {
                            appointment.symptoms
                          }
                        </p>

                      </div>

                    )}


                    {/* ======================
                        CONSULTATION RESULTS
                    ====================== */}

                    {status === "COMPLETED" &&
                      visit && (

                      <div
                        style={{
                          marginTop: "25px",
                          paddingTop: "20px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <h3
                          style={{
                            marginTop: 0,
                            color: "#172033",
                            fontSize: "22px",
                          }}
                        >
                          Consultation
                        </h3>


                        {/* Clinical Notes */}

                        {visit.clinicalNotes && (

                          <div
                            style={{
                              background:
                                "#f8fafc",
                              padding: "18px",
                              borderRadius:
                                "10px",
                              marginTop:
                                "12px",
                            }}
                          >

                            <strong>
                              Doctor's Notes
                            </strong>

                            <p
                              style={{
                                color: "#555",
                                lineHeight:
                                  "1.6",
                                whiteSpace:
                                  "pre-wrap",
                                marginBottom: 0,
                              }}
                            >
                              {
                                visit.clinicalNotes
                              }
                            </p>

                          </div>

                        )}


                        {/* Diagnosis */}

                        {visit.diagnosis && (

                          <div
                            style={{
                              marginTop: "15px",
                            }}
                          >

                            <strong>
                              Diagnosis
                            </strong>

                            <p
                              style={{
                                color: "#666",
                                lineHeight:
                                  "1.5",
                              }}
                            >
                              {
                                visit.diagnosis
                              }
                            </p>

                          </div>

                        )}


                        {/* Patient Summary */}

                        {visit.patientSummary && (

                          <div
                            style={{
                              marginTop: "15px",
                            }}
                          >

                            <strong>
                              Summary
                            </strong>

                            <p
                              style={{
                                color: "#666",
                                lineHeight:
                                  "1.5",
                              }}
                            >
                              {
                                visit.patientSummary
                              }
                            </p>

                          </div>

                        )}


                        {/* Follow-up Instructions */}

                        {visit.followUpInstructions && (

                          <div
                            style={{
                              marginTop: "15px",
                            }}
                          >

                            <strong>
                              Follow-up Instructions
                            </strong>

                            <p
                              style={{
                                color: "#666",
                                lineHeight:
                                  "1.5",
                              }}
                            >
                              {
                                visit.followUpInstructions
                              }
                            </p>

                          </div>

                        )}


                        {/* Prescriptions */}

                        {visit.prescriptions?.length > 0 && (

                          <div
                            style={{
                              marginTop: "20px",
                            }}
                          >

                            <strong>
                              Prescriptions
                            </strong>

                            <div
                              style={{
                                marginTop: "10px",
                                display: "grid",
                                gap: "10px",
                              }}
                            >

                              {visit.prescriptions.map(
                                (prescription) => (

                                  <div
                                    key={
                                      prescription.id
                                    }
                                    style={{
                                      background:
                                        "#f8fafc",
                                      padding:
                                        "15px",
                                      borderRadius:
                                        "8px",
                                      border:
                                        "1px solid #e5e7eb",
                                    }}
                                  >

                                    <strong>
                                      {
                                        prescription.medicationName
                                      }
                                    </strong>

                                    <p
                                      style={{
                                        margin:
                                          "5px 0",
                                        color:
                                          "#555",
                                      }}
                                    >
                                      <strong>
                                        Dosage:
                                      </strong>{" "}
                                      {
                                        prescription.dosage
                                      }
                                    </p>

                                    <p
                                      style={{
                                        margin:
                                          "5px 0",
                                        color:
                                          "#555",
                                      }}
                                    >
                                      <strong>
                                        Frequency:
                                      </strong>{" "}
                                      {
                                        prescription.frequency
                                      }
                                    </p>

                                    {prescription.duration && (

                                      <p
                                        style={{
                                          margin:
                                            "5px 0",
                                          color:
                                            "#555",
                                        }}
                                      >
                                        <strong>
                                          Duration:
                                        </strong>{" "}
                                        {
                                          prescription.duration
                                        }
                                      </p>

                                    )}

                                    {prescription.instructions && (

                                      <p
                                        style={{
                                          margin:
                                            "5px 0",
                                          color:
                                            "#555",
                                        }}
                                      >
                                        <strong>
                                          Instructions:
                                        </strong>{" "}
                                        {
                                          prescription.instructions
                                        }
                                      </p>

                                    )}

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}

                      </div>

                    )}


                    {/* ======================
                        NO VISIT YET
                    ====================== */}

                    {status === "COMPLETED" &&
                      !visit && (

                      <div
                        style={{
                          marginTop: "20px",
                          padding: "15px",
                          background: "#fff8e1",
                          borderRadius: "8px",
                          color: "#795548",
                        }}
                      >
                        Consultation details
                        are not available yet.
                      </div>

                    )}


                    {/* ======================
                        APPOINTMENT ID
                    ====================== */}

                    <p
                      style={{
                        marginTop: "20px",
                        fontSize: "12px",
                        color: "#999",
                      }}
                    >
                      Appointment ID:{" "}
                      {appointment.id}
                    </p>


                    {/* ======================
                        CANCEL BUTTON
                    ====================== */}

                    {canCancel && (

                      <button
                        onClick={() =>
                          handleCancel(
                            appointment.id
                          )
                        }
                        style={{
                          marginTop: "5px",
                          padding:
                            "10px 18px",
                          border: "none",
                          borderRadius:
                            "8px",
                          background:
                            "#dc2626",
                          color:
                            "#ffffff",
                          cursor:
                            "pointer",
                          fontSize:
                            "15px",
                          fontWeight:
                            "600",
                        }}
                      >
                        Cancel Appointment
                      </button>

                    )}

                  </div>

                );

              }
            )}

          </div>

        )}

    </div>
  );
};


export default PatientAppointments;