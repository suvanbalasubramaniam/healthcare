import { useEffect, useState } from "react";
import AppointmentCard from "../../components/doctor/AppointmentCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getDoctorAppointments } from "../../services/doctorService";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);

        const result = await getDoctorAppointments();

        const data =
          result?.appointments ||
          result ||
          [];

        setAppointments(data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage your scheduled patient appointments.</p>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <ErrorMessage message={error} />
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="empty-state">
          <h2>No appointments</h2>
          <p>You currently have no appointments.</p>
        </div>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;