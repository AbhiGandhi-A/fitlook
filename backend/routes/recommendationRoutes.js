import express from "express"
import { fetchAllProducts } from "../utils/shopifyClient.js"
import { getRecommendations } from "../utils/recommender.js"

const router = express.Router()

// POST: Get recommendations based on selected item
router.post("/get", async (req, res) => {
  try {
    const { selectedProductId, userPreferences } = req.body

    if (!selectedProductId) {
      return res.status(400).json({ error: "Product ID required" })
    }

    console.log("[FitLook] Getting recommendations for product:", selectedProductId)

    // Fetch all products to find the selected one
    const allProducts = await fetchAllProducts()
    const selectedProduct = allProducts.find((p) => p.id === Number.parseInt(selectedProductId))

    if (!selectedProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Get recommendations using AI logic
    const recommendations = await getRecommendations(selectedProduct, userPreferences, allProducts)

    res.json({
      selectedProduct,
      recommendations,
    })
  } catch (error) {
    console.error("[FitLook] Error getting recommendations:", error.message)
    res.status(500).json({ error: "Failed to get recommendations" })
  }
})

// POST: Get complete outfit recommendations
router.post("/complete-outfit", async (req, res) => {
  try {
    const { topId, bottomId, userPreferences } = req.body

    console.log("[FitLook] Getting complete outfit recommendations")

    // Fetch all products
    const allProducts = await fetchAllProducts()

    // Find selected items
    const top = allProducts.find((p) => p.id === Number.parseInt(topId))
    const bottom = allProducts.find((p) => p.id === Number.parseInt(bottomId))

    if (!top || !bottom) {
      return res.status(404).json({ error: "One or both items not found" })
    }

    // Get shoe recommendations
    const shoeRecommendations = allProducts
      .filter((p) => p.productType.toLowerCase().includes("shoe") || p.productType.toLowerCase().includes("footwear"))
      .slice(0, 3)

    // Get accessory recommendations
    const accessoryRecommendations = allProducts
      .filter((p) => p.productType.toLowerCase().includes("accessory") || p.productType.toLowerCase().includes("belt"))
      .slice(0, 3)

    res.json({
      outfit: { top, bottom },
      shoes: shoeRecommendations,
      accessories: accessoryRecommendations,
    })
  } catch (error) {
    console.error("[FitLook] Error getting complete outfit:", error.message)
    res.status(500).json({ error: "Failed to get complete outfit" })
  }
})

export default router
