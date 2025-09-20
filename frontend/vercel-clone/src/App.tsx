import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import AppLayout from "./layouts/AppLayout";
import Projects from "./components/Projects";
import Deployments from "./components/Deployments";
import DeploymentLogs from "./components/DeploymentLogs";
import ProjectDetails from "./components/ProjectDetails";
import Analytics from "./components/Analytics";
//import ProjectAnalytics from "./components/ProjectAnalytics";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/deployments" element={<Deployments />} />
            <Route path="/deployments/:id/logs" element={<DeploymentLogs />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/analytics/" element={<Analytics />} />
            {/* <Route path="/analytics/:id" element={<ProjectAnalytics />} /> */}
          </Route>
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
