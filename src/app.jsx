import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import AdminLayout from "./pages/dashboard/adminLayout";
import KitchenOrdersPage from "./pages/kitchenOrders/kitchenOrders";

const ProtectedRoute = ({ children }) =>
  localStorage.getItem("adminToken") ? children : <Navigate to="/" replace />;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kitchen-orders" element={<KitchenOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;