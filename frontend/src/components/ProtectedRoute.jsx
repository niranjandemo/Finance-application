import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      // No token
      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setAuthenticated(false);
          return;
        }

        // Store the latest user information
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setAuthenticated(true);

      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        setAuthenticated(false);

      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, []);

  // While checking the token
  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated
  return children;
}

export default ProtectedRoute;