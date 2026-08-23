import { useState } from "react";

const VisitNotesForm = ({
  appointment,
  onSubmit,
  loading = false,
}) => {
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [prescriptions, setPrescriptions] = useState([
    {
      medicationName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removePrescription = (index) => {
    setPrescriptions(
      prescriptions.filter((_, i) => i !== index)
    );
  };

  const updatePrescription = (
    index,
    field,
    value
  ) => {
    setPrescriptions((current) =>
      current.map((prescription, i) =>
        i === index
          ? {
              ...prescription,
              [field]: value,
            }
          : prescription
      )
    );
  };

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

    const validPrescriptions = prescriptions
      .filter(
        (prescription) =>
          prescription.medicationName.trim() &&
          prescription.dosage.trim() &&
          prescription.frequency.trim()
      )
      .map((prescription) => ({
        medicationName:
          prescription.medicationName.trim(),

        dosage:
          prescription.dosage.trim(),

        frequency:
          prescription.frequency.trim(),

        duration:
          prescription.duration.trim(),

        instructions:
          prescription.instructions.trim(),
      }));

    const visitData = {
      appointmentId: appointment.id,
      clinicalNotes: trimmedNotes,
      diagnosis: diagnosis.trim(),
      prescriptions: validPrescriptions,
    };

    console.log(
      "🔥 Creating visit with:",
      visitData
    );

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
        <label>
          <strong>Clinical Notes</strong>
        </label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Enter consultation notes..."
          rows={6}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            resize: "vertical",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "block",
            marginTop: "20px",
          }}
        >
          <strong>Diagnosis</strong>
        </label>

        <input
          type="text"
          value={diagnosis}
          onChange={(e) =>
            setDiagnosis(e.target.value)
          }
          placeholder="Enter diagnosis..."
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            marginTop: "25px",
          }}
        >
          <h2>Prescriptions</h2>

          {prescriptions.map(
            (prescription, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  padding: "18px",
                  borderRadius: "10px",
                  marginTop: "15px",
                }}
              >
                <h3>
                  Prescription {index + 1}
                </h3>

                <input
                  type="text"
                  placeholder="Medication name"
                  value={
                    prescription.medicationName
                  }
                  onChange={(e) =>
                    updatePrescription(
                      index,
                      "medicationName",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />

                <input
                  type="text"
                  placeholder="Dosage (e.g. 500 mg)"
                  value={prescription.dosage}
                  onChange={(e) =>
                    updatePrescription(
                      index,
                      "dosage",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />

                <input
                  type="text"
                  placeholder="Frequency (e.g. Twice daily)"
                  value={
                    prescription.frequency
                  }
                  onChange={(e) =>
                    updatePrescription(
                      index,
                      "frequency",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />

                <input
                  type="text"
                  placeholder="Duration (e.g. 5 days)"
                  value={
                    prescription.duration
                  }
                  onChange={(e) =>
                    updatePrescription(
                      index,
                      "duration",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />

                <textarea
                  placeholder="Instructions"
                  value={
                    prescription.instructions
                  }
                  onChange={(e) =>
                    updatePrescription(
                      index,
                      "instructions",
                      e.target.value
                    )
                  }
                  disabled={loading}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />

                {prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removePrescription(index)
                    }
                    disabled={loading}
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )
          )}

          <button
            type="button"
            onClick={addPrescription}
            disabled={loading}
            style={{
              marginTop: "15px",
              padding: "10px 15px",
            }}
          >
            + Add Prescription
          </button>
        </div>

        <button
          type="submit"
          disabled={
            loading || !notes.trim()
          }
          style={{
            marginTop: "25px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor:
              loading || !notes.trim()
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? "Saving..."
            : "Save Consultation"}
        </button>
      </form>
    </div>
  );
};

export default VisitNotesForm;