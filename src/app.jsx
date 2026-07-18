import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import AdminLayout from "./pages/dashboard/adminLayout";
import KitchenOrdersPage from "./pages/kitchenOrders/kitchenOrders";
import Settlements from "./pages/settlements/settlements";
import SettlementDetails from "./pages/settlements/settlementDetails";

const ProtectedRoute = ({ children }) =>
  localStorage.getItem("adminToken") ? children : <Navigate to="/" replace />;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kitchen-orders" element={<KitchenOrdersPage />} />
          <Route path="settlement" element={<Settlements />} />
          <Route path="settlements/:id" element={<SettlementDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
