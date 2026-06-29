import apiClient from "../utils/apiClient";

export const loginAdmin = async (email, password) => {
  try {
    const response = await apiClient.post("/api/admin/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};