import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmAppointment } from "../../services/doctorService";

const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();

  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState(
    appointment.status || ""
  );

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
    ? `${patient.firstName || ""} ${
        patient.lastName || ""
      }`.trim()
    : "Patient";

  // Normalize status so HELD / held / "HELD " all work
  const normalizedStatus = String(status)
    .trim()
    .toUpperCase();

  const handleConfirm = async () => {
    try {
      setConfirming(true);

      const updatedAppointment =
        await confirmAppointment(appointment.id);

      setStatus(
        updatedAppointment?.status || "CONFIRMED"
      );
    } catch (err) {
      console.error(
        "Failed to confirm appointment:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to confirm appointment."
      );
    } finally {
      setConfirming(false);
    }
  };

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
        {appointment.symptoms ||
          "No symptoms provided"}
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
        {status}
      </p>

      {/* CONFIRM APPOINTMENT */}
      {normalizedStatus === "HELD" && (
        <button
          onClick={handleConfirm}
          disabled={confirming}
          style={{
            padding: "10px 16px",
            marginRight: "10px",
            border: "none",
            borderRadius: "8px",
            cursor: confirming
              ? "not-allowed"
              : "pointer",
            background: "#2563eb",
            color: "#fff",
            fontSize: "15px",
          }}
        >
          {confirming
            ? "Confirming..."
            : "Confirm Appointment"}
        </button>
      )}

      {/* CONSULTATION */}
      {normalizedStatus !== "CANCELLED" && (
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
            fontSize: "15px",
          }}
        >
          {normalizedStatus === "COMPLETED"
            ? "View Consultation"
            : "Open Consultation"}
        </button>
      )}
    </div>
  );
};

export default AppointmentCard;