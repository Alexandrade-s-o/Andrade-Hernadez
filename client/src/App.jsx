import { Navigate, Route, Routes } from "react-router-dom";
import ClientDashboard from "./pages/ClientDashboard";
import ProducerDashboard from "./pages/ProducerDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cliente" replace />} />
      <Route path="/login" element={<Navigate to="/cliente" replace />} />
      <Route path="/cliente" element={<ClientDashboard />} />
      <Route path="/productor" element={<ProducerDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
