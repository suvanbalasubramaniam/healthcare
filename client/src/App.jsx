import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Consultation from "./pages/doctor/Consultation";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorSearchPage from "./pages/patient/DoctorSearchPage";
import DoctorDetails from "./pages/patient/DoctorDetails";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientAppointments from "./pages/patient/PatientAppointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/doctor"
          element={<DoctorDashboard />}
        />

        <Route
  path="/doctor/consultation/:appointmentId"
  element={<Consultation />}
/>

<Route
  path="/patient"
  element={<PatientDashboard />}
/>

<Route
  path="/patient/doctors"
  element={<DoctorSearchPage />}
/>

<Route
  path="/patient/doctors/:doctorId"
  element={<DoctorDetails />}
/>

<Route
  path="/patient/doctors/:doctorId/book"
  element={<BookAppointment />}
/>

<Route
  path="/patient/appointments"
  element={<PatientAppointments />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;