import apiClient from "../utils/apiClient";

/** The API answers with { success, data: {...} }. Unwrap to the payload,
 *  while still tolerating an endpoint that returns the body directly. */
const unwrap = (body) =>
  body && typeof body === "object" && "success" in body && "data" in body
    ? body.data
    : body;

export const getSubscriptions = async (status) => {
  try {
    const response = await apiClient.get("/api/admin/subscriptions", {
      params: status ? { status } : {},
    });
    return unwrap(response.data);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to load subscriptions",
      { cause: error },
    );
  }
};

/** Active bowls in this subscription's tier — the options for the slot picker. */
export const getTierProducts = async (subscriptionId) => {
  try {
    const response = await apiClient.get(
      `/api/admin/subscriptions/${subscriptionId}/products`,
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to load bowls",
      { cause: error },
    );
  }
};

/** Swap the bowl in one planned slot. */
export const updateMealSlot = async (mealPlannerId, productId) => {
  try {
    const response = await apiClient.put(
      `/api/admin/meal-planner/slot/${mealPlannerId}`,
      { product_id: productId },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update the slot",
      { cause: error },
    );
  }
};

/** Re-roll every still-editable slot onto a random bowl from the tier. */
export const shuffleMealSlots = async (subscriptionId, targetDate) => {
  try {
    const response = await apiClient.post(
      `/api/admin/meal-planner/${subscriptionId}/shuffle`,
      targetDate ? { target_date: targetDate } : {},
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to shuffle meals",
      { cause: error },
    );
  }
};

export const getSubscriptionById = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/subscriptions/${id}`);
    return unwrap(response.data);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to load subscription",
      { cause: error },
    );
  }
};
