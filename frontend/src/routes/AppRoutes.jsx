import { Routes, Route } from "react-router-dom";

// Importing pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CreateProject from "../pages/CreateProject";
import ProjectDetails from "../pages/ProjectDetails";

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Portal */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Operator Control Panels */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create" element={<CreateProject />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
    </Routes>
  );
}

export default AppRoutes;