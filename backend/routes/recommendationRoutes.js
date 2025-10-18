// Recommendation API routes - AI-powered outfit recommendations
import express from "express"
import { getRecommendations } from "../utils/recommender.js"
import ProductCategory from "../models/ProductCategory.js"

const router = express.Router()

// POST: Get recommendations based on selected item
router.post("/get", async (req, res) => {
  try {
    const { selectedProductId, userPreferences } = req.body

    if (!selectedProductId) {
      return res.status(400).json({ error: "Product ID required" })
    }

    // Fetch the selected product
    const selectedProduct = await ProductCategory.findOne({ shopifyProductId: selectedProductId })

    if (!selectedProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Get recommendations using AI logic
    const recommendations = await getRecommendations(selectedProduct, userPreferences)

    res.json({
      selectedProduct,
      recommendations,
    })
  } catch (error) {
    console.error("Error getting recommendations:", error)
    res.status(500).json({ error: "Failed to get recommendations" })
  }
})

// POST: Get complete outfit recommendations
router.post("/complete-outfit", async (req, res) => {
  try {
    const { topId, bottomId, userPreferences } = req.body

    // Fetch both items
    const top = await ProductCategory.findOne({ shopifyProductId: topId })
    const bottom = await ProductCategory.findOne({ shopifyProductId: bottomId })

    if (!top || !bottom) {
      return res.status(404).json({ error: "One or both items not found" })
    }

    // Get shoe and accessory recommendations
    const shoeRecommendations = await ProductCategory.find({
      category: "shoes",
      style: { $in: top.style },
    }).limit(3)

    const accessoryRecommendations = await ProductCategory.find({
      category: "accessory",
      style: { $in: top.style },
    }).limit(3)

    res.json({
      outfit: { top, bottom },
      shoes: shoeRecommendations,
      accessories: accessoryRecommendations,
    })
  } catch (error) {
    console.error("Error getting complete outfit:", error)
    res.status(500).json({ error: "Failed to get complete outfit" })
  }
})

export default router
