import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDoctorAppointments } from "../../services/appointmentService";
import AppointmentCard from "./AppointmentCard";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointments = await getDoctorAppointments();

        setAppointments(appointments);
      } catch (err) {
        console.error("Failed to load appointments:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const today = new Date().toDateString();

  const todayAppointments = appointments.filter(
    (appointment) => {
      if (!appointment.startTime) return false;

      return (
        new Date(
          appointment.startTime
        ).toDateString() === today
      );
    }
  );

  const upcomingAppointments = appointments.filter(
    (appointment) => {
      if (!appointment.startTime) return false;

      return (
        new Date(appointment.startTime) >= new Date()
      );
    }
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px 50px",
      }}
    >
      {/* Header */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Doctor Dashboard
          </h1>

          <p style={{ color: "#666" }}>
            Welcome, Dr.{" "}
            {user?.firstName || "Doctor"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h3>Today's Appointments</h3>

          <p
            style={{
              fontSize: "30px",
              margin: 0,
            }}
          >
            {todayAppointments.length}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h3>Upcoming</h3>

          <p
            style={{
              fontSize: "30px",
              margin: 0,
            }}
          >
            {upcomingAppointments.length}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h3>Total Appointments</h3>

          <p
            style={{
              fontSize: "30px",
              margin: 0,
            }}
          >
            {appointments.length}
          </p>
        </div>
      </div>

      {/* Appointments */}

      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
        }}
      >
        <h2>Appointments</h2>

        {loading && (
          <p>Loading appointments...</p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          appointments.length === 0 && (
            <p>No appointments found.</p>
          )}

        {!loading &&
          !error &&
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
            />
          ))}
      </section>
    </div>
  );
};

export default DoctorDashboard;