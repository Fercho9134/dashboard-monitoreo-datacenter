// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveDashboard from "./pages/LiveDashboard";
import SensorDetail from "./pages/SensorDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PredictionsPage from "./pages/PredictionsPage";
import { NotificationsProvider } from "./components/Navbar";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      {/* Proveedor de contexto para las notificaciones */}
      <NotificationsProvider>
      {/* Navbar se muestra en todas las páginas */}
      <Navbar />

      {/* Definición de rutas */}
      <Routes>
        <Route path="/" element={<LiveDashboard />} />
        <Route path="/sensor" element={<SensorDetail />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        {/* Puedes agregar más rutas aquí */}
        
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        newestOnTop
        closeOnClick={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={true}
        limit={3}
        toastStyle={{
          margin: "0 0 1rem 0",
          width: "280px",
          background: "rgba(17, 24, 39, 0.95)",
          backdropFilter: "blur(4px)",
          borderLeft: "4px solid",
          borderColor: "inherit",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
        bodyStyle={{
          padding: "12px 16px",
        }}
      />
      
      {/* Footer se muestra en todas las páginas */}
      <Footer />
      </NotificationsProvider>
    
    </Router>
    
  );
}

export default App;