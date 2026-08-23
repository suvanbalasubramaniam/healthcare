import { useState } from "react";

const PrescriptionForm = ({
  visitId,
  onSubmit,
  loading = false,
}) => {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!visitId) {
      console.error("❌ Visit ID is missing");
      return;
    }

    if (!medicationName.trim()) {
      return;
    }

    if (!dosage.trim()) {
      return;
    }

    if (!frequency.trim()) {
      return;
    }

    const prescriptionData = {
      visitId,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim(),
    };

    console.log(
      "💊 Creating prescription:",
      prescriptionData
    );

    onSubmit(prescriptionData);

    setMedicationName("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setInstructions("");
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
        marginTop: "25px",
      }}
    >
      <h2>Prescription</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Medication name"
          value={medicationName}
          onChange={(e) =>
            setMedicationName(e.target.value)
          }
          disabled={loading}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Dosage (e.g. 500 mg)"
          value={dosage}
          onChange={(e) =>
            setDosage(e.target.value)
          }
          disabled={loading}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Frequency (e.g. Twice daily)"
          value={frequency}
          onChange={(e) =>
            setFrequency(e.target.value)
          }
          disabled={loading}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Duration (e.g. 5 days)"
          value={duration}
          onChange={(e) =>
            setDuration(e.target.value)
          }
          disabled={loading}
          style={inputStyle}
        />

        <textarea
          placeholder="Instructions (optional)"
          value={instructions}
          onChange={(e) =>
            setInstructions(e.target.value)
          }
          disabled={loading}
          rows={4}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />

        <button
          type="submit"
          disabled={
            loading ||
            !medicationName.trim() ||
            !dosage.trim() ||
            !frequency.trim()
          }
          style={{
            marginTop: "15px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor:
              loading ||
              !medicationName.trim() ||
              !dosage.trim() ||
              !frequency.trim()
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? "Saving..."
            : "Add Prescription"}
        </button>

      </form>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box",
};

export default PrescriptionForm;