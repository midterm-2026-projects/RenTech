import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import CustomerLayout from "./pages/CustomerLayout";
import NotAuthorized from "./pages/NotAuthorized";
import Login from "./components/Login";
import { getSession, clearSession } from "./components/Login";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onLogin={() => {
        const session = getSession();
        if (session?.role === "Admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/customer", { replace: true });
        }
      }}
      onBack={() => {
        clearSession();
        navigate("/", { replace: true });
      }}
    />
  );
}

function HomePage() {
  const session = getSession();
  if (session?.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }
  if (session?.role) {
    return <Navigate to="/customer" replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/customer" element={<CustomerLayout />} />
      <Route path="/unauthorized" element={<NotAuthorized />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
