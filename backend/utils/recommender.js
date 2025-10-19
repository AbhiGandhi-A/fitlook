/**
 * Get recommendations based on selected product and user preferences
 * @param {Object} selectedProduct - The product user selected
 * @param {Object} userPreferences - User's style preferences
 * @param {Array} allProducts - All available products from Shopify
 * @returns {Array} Array of recommended products
 */
export const getRecommendations = async (selectedProduct, userPreferences = {}, allProducts = []) => {
  try {
    const recommendations = []
    const userStyle = userPreferences.preferredStyle || "casual"

    // Determine product category from product type
    const productType = selectedProduct.productType.toLowerCase()
    const isTop = productType.includes("shirt") || productType.includes("top") || productType.includes("dress")
    const isBottom = productType.includes("pant") || productType.includes("jean") || productType.includes("bottom")
    const isShoe = productType.includes("shoe") || productType.includes("footwear")

    // Rule 1: If user selected a TOP, recommend BOTTOMS and SHOES
    if (isTop) {
      const bottoms = allProducts.filter(
        (p) =>
          (p.productType.toLowerCase().includes("pant") ||
            p.productType.toLowerCase().includes("jean") ||
            p.productType.toLowerCase().includes("bottom")) &&
          p.id !== selectedProduct.id,
      )

      const shoes = allProducts.filter(
        (p) =>
          (p.productType.toLowerCase().includes("shoe") || p.productType.toLowerCase().includes("footwear")) &&
          p.id !== selectedProduct.id,
      )

      recommendations.push(...bottoms.slice(0, 3), ...shoes.slice(0, 2))
    }

    // Rule 2: If user selected BOTTOM, recommend TOPS and SHOES
    if (isBottom) {
      const tops = allProducts.filter(
        (p) =>
          (p.productType.toLowerCase().includes("shirt") ||
            p.productType.toLowerCase().includes("top") ||
            p.productType.toLowerCase().includes("dress")) &&
          p.id !== selectedProduct.id,
      )

      const shoes = allProducts.filter(
        (p) =>
          (p.productType.toLowerCase().includes("shoe") || p.productType.toLowerCase().includes("footwear")) &&
          p.id !== selectedProduct.id,
      )

      recommendations.push(...tops.slice(0, 3), ...shoes.slice(0, 2))
    }

    // Rule 3: If user selected SHOES, recommend TOPS and BOTTOMS
    if (isShoe) {
      const tops = allProducts.filter(
        (p) =>
          (p.productType.toLowerCase().includes("shirt") ||
            p.productType.toLowerCase().includes("top") ||
            p.productType.toLowerCase().includes("dress")) &&
          p.id !== selectedProduct.id,
      )

      const bottoms = allProducts.filter(
        (p) =>
          (p.productType.toLowerCase().includes("pant") ||
            p.productType.toLowerCase().includes("jean") ||
            p.productType.toLowerCase().includes("bottom")) &&
          p.id !== selectedProduct.id,
      )

      recommendations.push(...tops.slice(0, 2), ...bottoms.slice(0, 2))
    }

    // Rule 4: Always recommend accessories
    const accessories = allProducts.filter(
      (p) =>
        (p.productType.toLowerCase().includes("accessory") ||
          p.productType.toLowerCase().includes("belt") ||
          p.productType.toLowerCase().includes("bag")) &&
        p.id !== selectedProduct.id,
    )

    recommendations.push(...accessories.slice(0, 2))

    // Remove duplicates
    const uniqueRecommendations = Array.from(new Map(recommendations.map((item) => [item.id, item])).values())

    console.log(`[FitLook] Generated ${uniqueRecommendations.length} recommendations`)
    return uniqueRecommendations
  } catch (error) {
    console.error("[FitLook] Error in recommendation engine:", error.message)
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

  // Check if both are from same vendor (often indicates good pairing)
  if (top.vendor === bottom.vendor) {
    score += 25
  }

  // Check price range compatibility
  const topPrice = Number.parseFloat(top.price)
  const bottomPrice = Number.parseFloat(bottom.price)
  const priceDiff = Math.abs(topPrice - bottomPrice)

  if (priceDiff < 50) {
    score += 25
  }

  return Math.min(score, 100)
}
