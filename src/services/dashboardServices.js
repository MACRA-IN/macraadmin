import apiClient from "../utils/apiClient";

export const getKitchenOrders = async () => {
  try {
    const response = await apiClient.get("/api/admin/kitchen-orders");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch kitchen orders");
  }
};