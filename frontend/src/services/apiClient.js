// API client for communicating with FitLook backend

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

/**
 * Make API call to backend
 * @param {String} endpoint - API endpoint (e.g., '/products/shopify/all')
 * @param {String} method - HTTP method (GET, POST, etc.)
 * @param {Object} data - Request body data
 * @returns {Promise} API response
 */
export const apiCall = async (endpoint, method = "GET", data = null) => {
  try {
    console.log(`[FitLook] API Call: ${method} ${endpoint}`)

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    console.log(`[FitLook] API Response:`, result)
    return result
  } catch (error) {
    console.error(`[FitLook] API Error:`, error.message)
    throw error
  }
}

// User API calls
export const saveUserProfile = (profile) => apiCall("/user/profile", "POST", profile)
export const getUserProfile = (userId) => apiCall(`/user/${userId}`, "GET")

// Product API calls
export const fetchAllProducts = () => apiCall("/products/shopify/all", "GET")
export const fetchProductById = (productId) => apiCall(`/products/${productId}`, "GET")
export const searchProducts = (query) => apiCall(`/products/search?query=${query}`, "GET")
export const getProductsByCategory = (category) => apiCall(`/products/category/${category}`, "GET")

// Recommendation API calls
export const getRecommendations = (productId, preferences) =>
  apiCall("/recommend/get", "POST", { selectedProductId: productId, userPreferences: preferences })
export const getCompleteOutfitRecommendations = (topId, bottomId, preferences) =>
  apiCall("/recommend/complete-outfit", "POST", { topId, bottomId, userPreferences: preferences })

// Cart API calls
export const addItemToCart = (variantId, quantity = 1) => apiCall("/cart/add-item", "POST", { variantId, quantity })
export const addOutfitToCart = (topVariantId, bottomVariantId, shoeVariantId, accessoryVariantIds) =>
  apiCall("/cart/add-outfit", "POST", { topVariantId, bottomVariantId, shoeVariantId, accessoryVariantIds })

// Admin API calls
export const getDiscountRules = (password) => apiCall("/admin/discount-rules", "POST", { password })
export const createDiscountRule = (password, rule) => apiCall("/admin/discount-rules", "POST", { password, ...rule })
