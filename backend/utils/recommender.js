// AI Recommendation Engine - suggests complementary clothing items
// This module contains the core logic for outfit recommendations

/**
 * Get recommendations based on selected product and user preferences
 * @param {Object} selectedProduct - The product user selected
 * @param {Object} userPreferences - User's style preferences
 * @returns {Array} Array of recommended products
 */
export const getRecommendations = async (selectedProduct, userPreferences = {}) => {
  try {
    // Import ProductCategory here to avoid circular dependencies
    const { default: ProductCategory } = await import("../models/ProductCategory.js")

    const recommendations = []
    const userStyle = userPreferences.preferredStyle || "casual"

    // Rule 1: If user selected a TOP, recommend BOTTOMS and SHOES
    if (selectedProduct.category === "top" || selectedProduct.category === "dress") {
      const bottoms = await ProductCategory.find({
        category: { $in: ["bottom", "jeans"] },
        style: { $in: selectedProduct.style },
      }).limit(3)

      const shoes = await ProductCategory.find({
        category: "shoes",
        style: { $in: selectedProduct.style },
      }).limit(2)

      recommendations.push(...bottoms, ...shoes)
    }

    // Rule 2: If user selected BOTTOM, recommend TOPS and SHOES
    if (selectedProduct.category === "bottom" || selectedProduct.category === "jeans") {
      const tops = await ProductCategory.find({
        category: { $in: ["top", "dress"] },
        style: { $in: selectedProduct.style },
      }).limit(3)

      const shoes = await ProductCategory.find({
        category: "shoes",
        style: { $in: selectedProduct.style },
      }).limit(2)

      recommendations.push(...tops, ...shoes)
    }

    // Rule 3: If user selected SHOES, recommend TOPS and BOTTOMS
    if (selectedProduct.category === "shoes") {
      const tops = await ProductCategory.find({
        category: { $in: ["top", "dress"] },
        style: { $in: selectedProduct.style },
      }).limit(2)

      const bottoms = await ProductCategory.find({
        category: { $in: ["bottom", "jeans"] },
        style: { $in: selectedProduct.style },
      }).limit(2)

      recommendations.push(...tops, ...bottoms)
    }

    // Rule 4: Always recommend accessories
    const accessories = await ProductCategory.find({
      category: "accessory",
      style: { $in: selectedProduct.style },
    }).limit(2)

    recommendations.push(...accessories)

    // Remove duplicates
    const uniqueRecommendations = Array.from(new Map(recommendations.map((item) => [item._id, item])).values())

    return uniqueRecommendations
  } catch (error) {
    console.error("Error in recommendation engine:", error)
    return []
  }
}

/**
 * Analyze user image to detect body shape (placeholder for future ML integration)
 * @param {String} imageBase64 - Base64 encoded image
 * @returns {Object} Detected body shape and color tone
 */
export const analyzeUserImage = (imageBase64) => {
  // Placeholder function - in production, integrate with ML model
  // For now, return dummy data
  return {
    bodyShape: "average",
    colorTone: "warm",
    skinTone: "medium",
    confidence: 0.75,
  }
}

/**
 * Calculate outfit compatibility score
 * @param {Object} top - Top product
 * @param {Object} bottom - Bottom product
 * @returns {Number} Compatibility score 0-100
 */
export const calculateCompatibilityScore = (top, bottom) => {
  let score = 50 // Base score

  // Check style match
  const commonStyles = top.style.filter((s) => bottom.style.includes(s))
  if (commonStyles.length > 0) {
    score += 25
  }

  // Check color compatibility (simple logic)
  const colorCompatibility = checkColorCompatibility(top.color, bottom.color)
  if (colorCompatibility) {
    score += 25
  }

  return Math.min(score, 100)
}

/**
 * Check if colors are compatible
 * @param {Array} topColors - Colors of top
 * @param {Array} bottomColors - Colors of bottom
 * @returns {Boolean} Whether colors are compatible
 */
const checkColorCompatibility = (topColors = [], bottomColors = []) => {
  // Simple color compatibility rules
  const neutrals = ["black", "white", "gray", "beige", "navy"]

  // If either is neutral, they're compatible
  if (topColors.some((c) => neutrals.includes(c)) || bottomColors.some((c) => neutrals.includes(c))) {
    return true
  }

  // Check for common colors
  const commonColors = topColors.filter((c) => bottomColors.includes(c))
  return commonColors.length > 0
}
