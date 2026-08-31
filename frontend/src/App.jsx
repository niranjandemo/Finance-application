import { Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RiskAssessment from "./pages/RiskAssessment";
import Market from "./pages/Market";
import Investments from "./pages/Investments";
import Brokers from "./pages/Brokers";
import Recommendations from "./pages/Recommendations";
import XAI from "./pages/XAI";
import Education from "./pages/Education";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Public Pages */}

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />


      {/* Protected Pages */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/risk-assessment"
        element={
          <ProtectedRoute>
            <RiskAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <Market />
          </ProtectedRoute>
        }
      />

      <Route
        path="/investments"
        element={
          <ProtectedRoute>
            <Investments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/brokers"
        element={
          <ProtectedRoute>
            <Brokers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/xai"
        element={
          <ProtectedRoute>
            <XAI />
          </ProtectedRoute>
        }
      />

      <Route
        path="/education"
        element={
          <ProtectedRoute>
            <Education />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;