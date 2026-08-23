import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "FETCHING DOCTOR WITH USER ID:",
          doctorId
        );

        const response = await api.get(
          `/doctors/${doctorId}`
        );

        console.log(
          "FULL DOCTOR RESPONSE:",
          response.data
        );

        /*
         * Backend controller returns:
         *
         * {
         *   success: true,
         *   data: {
         *     doctor: {...}
         *   }
         * }
         */

        const doctorData =
          response.data?.data?.doctor;

        console.log(
          "DOCTOR DATA:",
          doctorData
        );

        if (!doctorData) {
          throw new Error(
            "Doctor data was not returned by the server."
          );
        }

        setDoctor(doctorData);
      } catch (err) {
        console.error(
          "FAILED TO LOAD DOCTOR:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load doctor details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "50px",
        }}
      >
        <h2>Loading doctor...</h2>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "50px",
        }}
      >
        <h2>Something went wrong</h2>

        <p
          style={{
            color: "red",
            marginBottom: "20px",
          }}
        >
          {error}
        </p>

        <button
          onClick={() =>
            navigate("/patient/doctors")
          }
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  /* =========================
     DOCTOR NOT FOUND
  ========================= */

  if (!doctor) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "50px",
        }}
      >
        <h2>Doctor not found</h2>

        <button
          onClick={() =>
            navigate("/patient/doctors")
          }
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  /* =========================
     DOCTOR DATA
  ========================= */

  const profile =
    doctor.doctorProfile || {};

  const firstName =
    doctor.firstName || "";

  const lastName =
    doctor.lastName || "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  const specialization =
    profile.specialization ||
    "Specialization not provided";

  const bio =
    profile.bio ||
    "No biography available.";

  const licenseNumber =
    profile.licenseNumber ||
    "Not available";

  const slotDuration =
    profile.slotDurationMinutes || 30;

  const workingHours =
    Array.isArray(profile.workingHours)
      ? profile.workingHours
      : [];

  /*
   * IMPORTANT:
   *
   * doctor.id is the USER ID.
   *
   * We use this same ID when navigating
   * to the booking page.
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 60px",
      }}
    >
      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        onClick={() =>
          navigate("/patient/doctors")
        }
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "30px",
          fontSize: "16px",
        }}
      >
        ← Back to Doctors
      </button>

      {/* =========================
          DOCTOR HEADER
      ========================= */}

      <div
        style={{
          background: "#ffffff",
          padding: "35px",
          borderRadius: "16px",
          maxWidth: "900px",
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "42px",
            color: "#172033",
          }}
        >
          Dr. {fullName || "Doctor"}
        </h1>

        <h2
          style={{
            color: "#2563eb",
            marginBottom: "10px",
          }}
        >
          {specialization}
        </h2>

        <p
          style={{
            color: "#555",
            fontSize: "18px",
            lineHeight: "1.6",
          }}
        >
          {bio}
        </p>
      </div>

      {/* =========================
          INFORMATION
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
          maxWidth: "900px",
        }}
      >
        {/* CONTACT */}

        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Contact</h2>

          <p>
            <strong>Email</strong>
          </p>

          <p
            style={{
              color: "#666",
              marginTop: "-8px",
            }}
          >
            {doctor.email ||
              "Not available"}
          </p>

          <p>
            <strong>Phone</strong>
          </p>

          <p
            style={{
              color: "#666",
              marginTop: "-8px",
            }}
          >
            {doctor.phone ||
              "Not available"}
          </p>
        </div>

        {/* PROFESSIONAL INFORMATION */}

        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>
            Professional Information
          </h2>

          <p>
            <strong>
              Specialization
            </strong>
          </p>

          <p
            style={{
              color: "#666",
              marginTop: "-8px",
            }}
          >
            {specialization}
          </p>

          <p>
            <strong>
              License Number
            </strong>
          </p>

          <p
            style={{
              color: "#666",
              marginTop: "-8px",
            }}
          >
            {licenseNumber}
          </p>

          <p>
            <strong>
              Appointment Duration
            </strong>
          </p>

          <p
            style={{
              color: "#666",
              marginTop: "-8px",
            }}
          >
            {slotDuration} minutes
          </p>
        </div>
      </div>

      {/* =========================
          WORKING HOURS
      ========================= */}

      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "900px",
          marginTop: "25px",
        }}
      >
        <h2>Working Hours</h2>

        {workingHours.length === 0 ? (
          <p style={{ color: "#666" }}>
            Working hours are not available.
          </p>
        ) : (
          workingHours.map((hours) => (
            <div
              key={hours.id}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                padding: "14px 0",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              <strong>
                {hours.day}
              </strong>

              <span>
                {hours.startTime} -{" "}
                {hours.endTime}
              </span>
            </div>
          ))
        )}
      </div>

      {/* =========================
          BOOK APPOINTMENT
      ========================= */}

      <div
        style={{
          maxWidth: "900px",
          marginTop: "25px",
        }}
      >
        <button
          onClick={() => {
            console.log(
              "BOOKING DOCTOR USER ID:",
              doctor.id
            );

            navigate(
              `/patient/doctors/${doctor.id}/book`
            );
          }}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "600",
            background: "#2563eb",
            color: "#ffffff",
          }}
        >
          Book Appointment
        </button>
      </div>

      {/* DEBUG INFO */}

      <p
        style={{
          maxWidth: "900px",
          marginTop: "20px",
          color: "#999",
          fontSize: "13px",
        }}
      >
        Doctor User ID: {doctor.id}
      </p>
    </div>
  );
};

export default DoctorDetails;