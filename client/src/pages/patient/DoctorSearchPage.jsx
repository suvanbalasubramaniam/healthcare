import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../../services/doctorService";

const DoctorSearchPage = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getDoctors();

        console.log("DOCTORS API RESPONSE:", result);

        // getDoctors() already returns the doctors array
        const doctorList =
  result?.doctors ||
  result?.data?.doctors ||
  (Array.isArray(result) ? result : []);

console.log("NORMALIZED DOCTORS:", doctorList);

setDoctors(doctorList);
      } catch (err) {
        console.error("FAILED TO LOAD DOCTORS:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load doctors."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const firstName = doctor.firstName || "";
    const lastName = doctor.lastName || "";

    const specialization =
      doctor.doctorProfile?.specialization || "";

    const searchText = search
      .toLowerCase()
      .trim();

    const fullName =
      `${firstName} ${lastName}`.toLowerCase();

    return (
      fullName.includes(searchText) ||
      specialization
        .toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px 50px",
      }}
    >
      {/* HEADER */}
      <header
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
            Find a Doctor
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "20px",
              marginTop: "8px",
            }}
          >
            Search for a doctor and book an appointment.
          </p>
        </div>

        <button
          onClick={() => navigate("/patient")}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Back to Dashboard
        </button>
      </header>

      {/* SEARCH */}
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Search by doctor name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
          }}
        >
          <p>Loading doctors...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
          }}
        >
          <h2>Something went wrong</h2>

          <p style={{ color: "red" }}>
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* NO DOCTORS */}
      {!loading &&
        !error &&
        filteredDoctors.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "12px",
            }}
          >
            <h2>No doctors found</h2>

            <p style={{ color: "#666" }}>
              {search
                ? "No doctors match your search."
                : "There are currently no doctors available."}
            </p>
          </div>
        )}

      {/* DOCTOR CARDS */}
      {!loading &&
        !error &&
        filteredDoctors.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "25px",
            }}
          >
            {filteredDoctors.map((doctor) => {
              const firstName =
                doctor.firstName || "";

              const lastName =
                doctor.lastName || "";

              const specialization =
                doctor.doctorProfile?.specialization ||
                "Specialization not provided";

              const bio =
                doctor.doctorProfile?.bio ||
                "No biography available.";

              /*
               * IMPORTANT:
               *
               * doctor.id = USER ID
               *
               * This is the ID expected by:
               *
               * GET /doctors/:id
               *
               * because backend getDoctorById()
               * searches prisma.user using this ID.
               */

              return (
                <div
                  key={doctor.id}
                  style={{
                    background: "#ffffff",
                    padding: "25px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: "8px",
                      color: "#172033",
                    }}
                  >
                    Dr. {firstName} {lastName}
                  </h2>

                  <p
                    style={{
                      color: "#2563eb",
                      fontSize: "17px",
                      fontWeight: "600",
                      margin: "5px 0 12px",
                    }}
                  >
                    {specialization}
                  </p>

                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.5",
                    }}
                  >
                    {bio}
                  </p>

                  <button
                    onClick={() => {
                      console.log(
                        "OPENING DOCTOR:",
                        doctor.id
                      );

                      navigate(
                        `/patient/doctors/${doctor.id}`
                      );
                    }}
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      padding: "12px 20px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    View Doctor
                  </button>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default DoctorSearchPage;