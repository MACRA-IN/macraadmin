import apiClient from "../utils/apiClient";

export const getPendingMealPlannerCustomers = async () => {
  try {
    const response = await apiClient.get("api/admin/meal-planner/pending");
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response.data.message ||
        "Failed to fetch pending meal planner customers",
    );
  }
};
export const autoPlanMeals = async (subscriptionId, targetDate) => {
  const res = await apiClient.post(`api/admin/meal-planner/${subscriptionId}/auto-plan`, {
    target_date: targetDate,
  });
  return res.data;
};
