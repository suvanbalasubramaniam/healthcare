import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAppointment } from "../../services/appointmentService";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Available appointment times
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!selectedTime) {
      setError("Please select an appointment time.");
      return;
    }

    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }

    // Make sure doctor ID exists
    if (!doctorId) {
      setError("Doctor information is missing. Please go back and select a doctor.");
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       *
       * doctorId comes from:
       *
       * /patient/doctors/:doctorId/book
       *
       * DoctorSearchPage uses doctor.id here.
       *
       * doctor.id is the USER ID of the doctor,
       * which is what the backend appointment service expects.
       */

      const startTime = new Date(
        `${date}T${selectedTime}:00`
      );

      const endTime = new Date(
        startTime.getTime() + 30 * 60 * 1000
      );

      const appointmentData = {
        doctorId: doctorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        symptoms: symptoms.trim(),
      };

      console.log("=================================");
      console.log("CREATING APPOINTMENT");
      console.log("Doctor ID:", doctorId);
      console.log("Start Time:", appointmentData.startTime);
      console.log("End Time:", appointmentData.endTime);
      console.log("Symptoms:", appointmentData.symptoms);
      console.log("FULL REQUEST:", appointmentData);
      console.log("=================================");

      const appointment = await createAppointment(
        appointmentData
      );

      console.log(
        "APPOINTMENT CREATED SUCCESSFULLY:",
        appointment
      );

      alert("Appointment booked successfully!");

      navigate("/patient");
    } catch (err) {
      console.error("=================================");
      console.error("FAILED TO CREATE APPOINTMENT");
      console.error("STATUS:", err.response?.status);
      console.error(
        "RESPONSE:",
        err.response?.data
      );
      console.error(
        "REQUEST:",
        err.config?.data
      );
      console.error("=================================");

      setError(
        err.response?.data?.message ||
          "Failed to book appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    !date ||
    !selectedTime ||
    !symptoms.trim() ||
    !doctorId ||
    loading;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 50px",
      }}
    >
      {/* HEADER */}
      <div
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
            Book Appointment
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "20px",
            }}
          >
            Select a date and available appointment time.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/patient/doctors/${doctorId}`)
          }
          style={{
            padding: "14px 22px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "17px",
          }}
        >
          ← Back to Doctor
        </button>
      </div>

      {/* BOOKING CARD */}
      <div
        style={{
          background: "#fff",
          padding: "35px",
          borderRadius: "16px",
          maxWidth: "1000px",
        }}
      >
        <form onSubmit={handleSubmit}>

          {/* DATE */}
          <div style={{ marginBottom: "30px" }}>
            <h2>Select Date</h2>

            <input
              type="date"
              value={date}
              min={new Date()
                .toISOString()
                .split("T")[0]}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedTime("");
              }}
              style={{
                padding: "14px",
                fontSize: "18px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* TIME SLOTS */}
          {date && (
            <div style={{ marginBottom: "30px" }}>
              <h2>Available Time Slots</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "12px",
                  marginTop: "15px",
                }}
              >
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() =>
                      setSelectedTime(time)
                    }
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      cursor: "pointer",

                      border:
                        selectedTime === time
                          ? "2px solid #2563eb"
                          : "1px solid #ccc",

                      background:
                        selectedTime === time
                          ? "#eaf1ff"
                          : "#fff",

                      fontSize: "16px",
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SYMPTOMS */}
          <div style={{ marginBottom: "30px" }}>
            <h2>Symptoms</h2>

            <textarea
              value={symptoms}
              onChange={(e) =>
                setSymptoms(e.target.value)
              }
              placeholder="Describe your symptoms..."
              rows={6}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "17px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* ERROR */}
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={disabled}
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              cursor: disabled
                ? "not-allowed"
                : "pointer",

              background: disabled
                ? "#eee"
                : "#2563eb",

              color: disabled
                ? "#999"
                : "#fff",
            }}
          >
            {loading
              ? "Booking Appointment..."
              : "Confirm Appointment"}
          </button>
        </form>
      </div>

      {/* DEBUG INFO */}
      <p
        style={{
          marginTop: "20px",
          color: "#999",
          fontSize: "14px",
        }}
      >
        Doctor ID: {doctorId}
      </p>
    </div>
  );
};

export default BookAppointment;