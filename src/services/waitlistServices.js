import apiClient from "../utils/apiClient";

export const getWaitlistAreas = async () => {
  try {
    const response = await apiClient.get("/api/admin/waitlist/areas");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to load waitlist data",
    );
  }
};
