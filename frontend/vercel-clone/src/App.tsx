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
import ProjectAnalytics from "./components/ProjectAnalytics";
import Signup from "./components/Signup";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<AppLayout />}>
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deployments"
              element={
                <ProtectedRoute>
                  <Deployments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deployments/:id/logs"
              element={
                <ProtectedRoute>
                  <DeploymentLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:id"
              element={
                <ProtectedRoute>
                  <ProjectAnalytics />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
