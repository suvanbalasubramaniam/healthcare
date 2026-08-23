import { useNavigate } from "react-router-dom";

const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();

  const startTime = new Date(appointment.startTime);

  const date = startTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = startTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const patient = appointment.patient?.user;

  const patientName = patient
    ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
    : "Patient";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        marginTop: "15px",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      <h3>{patientName}</h3>

      <p>
        {appointment.symptoms || "No symptoms provided"}
      </p>

      <p>
        <strong>Date:</strong> {date}
      </p>

      <p>
        <strong>Time:</strong> {time}
      </p>

      <p>
        <strong>Urgency:</strong>{" "}
        {appointment.urgencyLevel || "Normal"}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {appointment.status}
      </p>

      <button
        onClick={() =>
          navigate(
            `/doctor/consultation/${appointment.id}`
          )
        }
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {appointment.status === "COMPLETED"
          ? "View Consultation"
          : "Open Consultation"}
      </button>
    </div>
  );
};

export default AppointmentCard;