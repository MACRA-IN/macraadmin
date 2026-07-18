import apiClient from "../utils/apiClient";

// Generate Settlement
export const generateSettlement = async () => {
  const response = await apiClient.post("api/settlements/generate");
  return response.data;
};

// Get All settlement
export const getsettlements = async () => {
  const response = await apiClient.get("api/settlements");
  return response.data;
};

// Get Settlement By ID
export const getSettlementById = async (id) => {
  const response = await apiClient.get(`api/settlements/${id}`);
  return response.data;
};

// Mark Settlement as Paid
export const markSettlementPaid = async (id, paid_amount) => {
  const response = await apiClient.put(`api/settlements/${id}/pay`, {
    paid_amount,
  });

  return response.data;
};
