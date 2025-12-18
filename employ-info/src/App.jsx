import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import EmployeeForm from "./pages/EmployeeForm.jsx";
import EmployeeList from "./pages/EmployeeList.jsx";
import EmployeeCV from "./pages/EmployeeCV.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import MyProfile from "./pages/MyProfile.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Employee form */}
        <Route path="/employees/new" element={<EmployeeForm />} />

        {/* Employee list */}
        <Route path="/employees" element={<EmployeeList />} />

        {/* CV Preview & PDF Export */}
        <Route path="/employees/:id/cv" element={<EmployeeCV />} />
        <Route path="/my-profile" element={<MyProfile />} />
        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="text-center mt-20 text-xl text-red-600">
              404 – Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
