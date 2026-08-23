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
      "Failed to parse pre-visit summary:",
      error
    );
  }

  return (
    <div className="symptom-summary">
      <div className="section-header">
        <h2>Patient Symptoms</h2>
      </div>

      {/* Chief Complaint */}
      <div className="symptom-box">
        <h3>Chief Complaint</h3>

        <p>
          {preVisitSummary?.chiefComplaint ||
            appointment.symptoms ||
            "No complaint provided."}
        </p>
      </div>

      {/* AI Suggested Questions */}
      {preVisitSummary?.suggestedQuestions?.length > 0 && (
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

      {/* Urgency */}
      {appointment.urgencyLevel && (
        <div className="urgency-box">
          <strong>Urgency:</strong>{" "}
          <span>{appointment.urgencyLevel}</span>
        </div>
      )}
    </div>
  );
};

export default SymptomSummary;