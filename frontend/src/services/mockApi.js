// Mock API service for v0 preview environment
// In production, this will use the real backend at localhost:5000

const mockDiscountRules = [
  {
    _id: "1",
    name: "Complete Outfit Discount",
    description: "Get 10% off when you buy a complete outfit (top + bottom)",
    discountPercentage: 10,
    requiredItems: { top: true, bottom: true },
  },
  {
    _id: "2",
    name: "Formal Bundle",
    description: "Get 15% off formal shirt + formal pants combo",
    discountPercentage: 15,
    requiredItems: { top: true, bottom: true },
  },
]

const mockUsers = {}

const mockProducts = [
  {
    id: "1",
    title: "Casual Blue Shirt",
    price: 29.99,
    image: "https://via.placeholder.com/300x400?text=Blue+Shirt",
    category: "top",
    style: "casual",
    color: "blue",
  },
  {
    id: "2",
    title: "Formal White Shirt",
    price: 49.99,
    image: "https://via.placeholder.com/300x400?text=White+Shirt",
    category: "top",
    style: "formal",
    color: "white",
  },
  {
    id: "3",
    title: "Black Jeans",
    price: 59.99,
    image: "https://via.placeholder.com/300x400?text=Black+Jeans",
    category: "bottom",
    style: "casual",
    color: "black",
  },
  {
    id: "4",
    title: "Formal Black Pants",
    price: 79.99,
    image: "https://via.placeholder.com/300x400?text=Black+Pants",
    category: "bottom",
    style: "formal",
    color: "black",
  },
  {
    id: "5",
    title: "White Sneakers",
    price: 89.99,
    image: "https://via.placeholder.com/300x400?text=White+Sneakers",
    category: "shoes",
    style: "casual",
    color: "white",
  },
  {
    id: "6",
    title: "Black Formal Shoes",
    price: 119.99,
    image: "https://via.placeholder.com/300x400?text=Black+Shoes",
    category: "shoes",
    style: "formal",
    color: "black",
  },
  {
    id: "7",
    title: "Gold Watch",
    price: 199.99,
    image: "https://via.placeholder.com/300x400?text=Gold+Watch",
    category: "accessory",
    style: "formal",
    color: "gold",
  },
  {
    id: "8",
    title: "Casual Belt",
    price: 24.99,
    image: "https://via.placeholder.com/300x400?text=Casual+Belt",
    category: "accessory",
    style: "casual",
    color: "brown",
  },
]

export const mockApi = {
  // User endpoints
  async saveUserProfile(userData) {
    const userId = `user_${Date.now()}`
    mockUsers[userId] = {
      _id: userId,
      ...userData,
      createdAt: new Date(),
    }
    return { success: true, user: mockUsers[userId] }
  },

  async getUserProfile(userId) {
    return mockUsers[userId] || null
  },

  // Admin endpoints
  async getDiscountRules(adminPassword) {
    if (adminPassword !== "admin123") {
      throw new Error("Unauthorized")
    }
    return mockDiscountRules
  },

  async createDiscountRule(rule, adminPassword) {
    if (adminPassword !== "admin123") {
      throw new Error("Unauthorized")
    }
    const newRule = {
      _id: `rule_${Date.now()}`,
      ...rule,
    }
    mockDiscountRules.push(newRule)
    return { success: true, rule: newRule }
  },

  // Product endpoints
  async fetchShopifyProducts() {
    return mockProducts
  },

  // Recommendation endpoints
  async getRecommendations(selectedProduct, userPreferences) {
    const recommendations = mockProducts.filter(
      (p) =>
        p.id !== selectedProduct.id &&
        p.style === (userPreferences?.preferredStyle || "casual") &&
        p.category !== selectedProduct.category,
    )
    return recommendations.slice(0, 4)
  },
}

export const isPreviewMode = () => {
  if (typeof window === "undefined") return false
  return !window.__BACKEND_AVAILABLE__
}

export const apiCall = async (endpoint, options = {}) => {
  const isPreview = isPreviewMode()

  console.log("[v0] API Call:", endpoint, "Preview Mode:", isPreview)

  if (isPreview) {
    // Simulate network delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (endpoint.includes("/api/user/profile")) {
      if (options.method === "POST") {
        const userData = JSON.parse(options.body || "{}")
        return mockApi.saveUserProfile(userData)
      }
    } else if (endpoint.includes("/api/admin/discount-rules")) {
      const adminPassword = options.adminPassword || options.headers?.adminPassword
      if (options.method === "POST") {
        const ruleData = JSON.parse(options.body || "{}")
        return mockApi.createDiscountRule(ruleData, adminPassword)
      } else if (options.method === "GET") {
        return mockApi.getDiscountRules(adminPassword)
      }
    } else if (endpoint.includes("/api/products")) {
      return mockApi.fetchShopifyProducts()
    } else if (endpoint.includes("/api/recommend")) {
      const body = JSON.parse(options.body || "{}")
      const recommendations = await mockApi.getRecommendations(body.product, body.userPreferences)
      return recommendations
    } else if (endpoint.includes("/api/cart")) {
      return { success: true, message: "Items added to cart (mock)" }
    }

    return { success: true, data: [] }
  }

  try {
    const response = await fetch(endpoint, options)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error("[v0] API Error:", error)
    throw error
  }
}
