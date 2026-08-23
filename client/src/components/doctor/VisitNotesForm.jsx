import { useEffect, useState } from "react";

const VisitNotesForm = ({
  appointment,
  onSubmit,
  loading = false,
}) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (appointment?.visit?.clinicalNotes) {
      setNotes(appointment.visit.clinicalNotes);
    } else {
      setNotes("");
    }
  }, [appointment]);

  const hasExistingVisit = !!appointment?.visit;

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const trimmedNotes = notes.trim();

    if (!trimmedNotes) {
      return;
    }

    if (!appointment?.id) {
      console.error("❌ Appointment ID is missing");
      return;
    }

    if (!onSubmit) {
      console.error("❌ onSubmit prop is missing");
      return;
    }

    const visitData = {
      appointmentId: appointment.id,
      clinicalNotes: trimmedNotes,
    };

    console.log("🔥 Creating visit with:", visitData);

    onSubmit(visitData);
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h2>Visit Notes</h2>

      <form onSubmit={handleFormSubmit}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter consultation notes..."
          rows={6}
          disabled={loading || hasExistingVisit}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            resize: "vertical",
            fontSize: "16px",
            boxSizing: "border-box",
            background: hasExistingVisit ? "#f5f5f5" : "#ffffff",
          }}
        />

        {!hasExistingVisit && (
          <button
            type="submit"
            disabled={loading || !notes.trim()}
            style={{
              marginTop: "15px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor:
                loading || !notes.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save Notes"}
          </button>
        )}

        {hasExistingVisit && (
          <p
            style={{
              marginTop: "15px",
              color: "#555",
              fontSize: "14px",
            }}
          >
            Consultation notes have already been saved.
          </p>
        )}
      </form>
    </div>
  );
};

export default VisitNotesForm;