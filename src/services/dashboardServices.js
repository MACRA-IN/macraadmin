import apiClient from "../utils/apiClient";

export const getKitchenOrders = async () => {
  try {
    const response = await apiClient.get("/api/admin/kitchen-orders");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch kitchen orders",
    );
  }
};
export const getStats = async () => {
  try {
    const response = await apiClient.get("/api/admin/stats");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch stats");
  }
};
export const triggerCreateOrders = async () => {
  try {
    const response = await apiClient.post("/api/orders/create");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to generate orders");
  }
};
export const getCustomers = async () => {
  try {
    const response = await apiClient.get("/api/admin/customers");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch customers",
    );
  }
};
export const getLocationChecks = async () => {
  try {
    const response = await apiClient.get("/api/admin/location-checks");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch location checks");
  }
};



export const getAllSubscriptions = async (status) => {
  const res = await apiClient.get("api/admin/subscriptions", { params: status ? { status } : {} });
  return res.data.data;
};

export const getSubscriptionDetail = async (subscriptionId) => {
  const res = await apiClient.get(`api/admin/subscriptions/${subscriptionId}`);
  return res.data.data;
};
