import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ClientDashboard from "./pages/ClientDashboard";
import ProducerDashboard from "./pages/ProducerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={["cliente"]}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/productor"
        element={
          <ProtectedRoute allowedRoles={["productor"]}>
            <ProducerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "cliente" ? "/cliente" : "/productor"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
