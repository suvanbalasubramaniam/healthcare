import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              color: "#172033",
            }}
          >
            Patient Dashboard
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "20px",
            }}
          >
            Welcome, {user?.firstName || "Patient"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "12px 22px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Logout
        </button>
      </header>

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "25px",
          maxWidth: "900px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "15px",
          }}
        >
          <h2>Find a Doctor</h2>

          <p style={{ color: "#666" }}>
            Search for doctors and find available
            appointment slots.
          </p>

          <button
            onClick={() => navigate("/patient/doctors")}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Find Doctors
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "15px",
          }}
        >
          <h2>My Appointments</h2>

          <p style={{ color: "#666" }}>
            View and manage your upcoming and previous
            appointments.
          </p>

          <button
            onClick={() => navigate("/patient/appointments")}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            View Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;