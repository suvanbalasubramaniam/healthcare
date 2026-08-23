const SymptomSummary = ({ appointment }) => {
  console.log("🔥 SYMPTOM SUMMARY RECEIVED:", appointment);

  return (
    <div
      style={{
        background: "yellow",
        padding: "30px",
        margin: "20px",
        border: "5px solid red",
        color: "black",
      }}
    >
      <h1>TEST — SYMPTOM COMPONENT</h1>

      <h2>Symptoms:</h2>

      <p style={{ fontSize: "24px" }}>
        {appointment?.symptoms || "NO SYMPTOMS"}
      </p>
    </div>
  );
};

export default SymptomSummary;