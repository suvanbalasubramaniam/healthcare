const SymptomSummary = ({ appointment }) => {
  if (!appointment) {
    return null;
  }

  let preVisitSummary = null;

  try {
    if (appointment.preVisitSummary) {
      preVisitSummary =
        typeof appointment.preVisitSummary === "string"
          ? JSON.parse(appointment.preVisitSummary)
          : appointment.preVisitSummary;
    }
  } catch (error) {
    console.error(
      "❌ Failed to parse pre-visit summary:",
      error
    );
  }

  const patient = appointment.patient;
  const patientUser = patient?.user;

  return (
    <div className="symptom-summary">

      {/* =====================================================
          PATIENT INFORMATION
      ====================================================== */}

      <div className="section-header">
        <h2>Patient Information</h2>
      </div>

      <div className="symptom-box">
        <p>
          <strong>Name:</strong>{" "}
          {patientUser
            ? `${patientUser.firstName} ${patientUser.lastName}`
            : "Not available"}
        </p>

        {patient?.dateOfBirth && (
          <p>
            <strong>Date of Birth:</strong>{" "}
            {new Date(patient.dateOfBirth).toLocaleDateString()}
          </p>
        )}

        {patient?.gender && (
          <p>
            <strong>Gender:</strong>{" "}
            {patient.gender}
          </p>
        )}

        {patient?.address && (
          <p>
            <strong>Address:</strong>{" "}
            {patient.address}
          </p>
        )}
      </div>

      {/* =====================================================
          PATIENT SYMPTOMS
      ====================================================== */}

      <div className="section-header">
        <h2>Patient Symptoms</h2>
      </div>

      <div className="symptom-box">
        <h3>Symptoms / Chief Complaint</h3>

        <p>
          {appointment.symptoms ||
            preVisitSummary?.chiefComplaint ||
            "No symptoms provided."}
        </p>
      </div>

      {/* =====================================================
          AI PRE-VISIT SUMMARY
      ====================================================== */}

      {preVisitSummary && (
        <>
          <div className="section-header">
            <h2>AI Pre-Visit Summary</h2>
          </div>

          {/* Chief Complaint */}

          <div className="symptom-box">
            <h3>Chief Complaint</h3>

            <p>
              {preVisitSummary.chiefComplaint ||
                "No chief complaint available."}
            </p>
          </div>

          {/* Suggested Questions */}

          {Array.isArray(
            preVisitSummary.suggestedQuestions
          ) &&
            preVisitSummary.suggestedQuestions.length > 0 && (
              <div className="questions-box">
                <h3>Suggested Questions</h3>

                <ul>
                  {preVisitSummary.suggestedQuestions.map(
                    (question, index) => (
                      <li key={index}>
                        {question}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </>
      )}

      {/* =====================================================
          URGENCY
      ====================================================== */}

      {(appointment.urgencyLevel ||
        preVisitSummary?.urgencyLevel) && (
        <div className="urgency-box">
          <strong>Urgency:</strong>{" "}

          <span>
            {appointment.urgencyLevel ||
              preVisitSummary.urgencyLevel}
          </span>
        </div>
      )}

      {/* =====================================================
          DEBUG INFORMATION
      ====================================================== */}

      {process.env.NODE_ENV === "development" && (
        <details style={{ marginTop: "20px" }}>
          <summary>
            Developer: Appointment Data
          </summary>

          <pre
            style={{
              marginTop: "10px",
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "8px",
              overflowX: "auto",
              fontSize: "12px",
            }}
          >
            {JSON.stringify(appointment, null, 2)}
          </pre>
        </details>
      )}

    </div>
  );
};

export default SymptomSummary;