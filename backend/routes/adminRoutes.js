// Admin API routes - manage discounts, rules, and product categories
import express from "express"
import DiscountRule from "../models/DiscountRule.js"
import ProductCategory from "../models/ProductCategory.js"

const router = express.Router()

// Middleware: Admin authentication
const adminAuth = (req, res, next) => {
  // Check password in body or headers
  const password = req.body?.adminPassword || req.headers?.["admin-password"]

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

// POST: Create discount rule
router.post("/discount-rules", adminAuth, async (req, res) => {
  try {
    const { name, description, discountPercentage, requiredItems, styleMatching } = req.body

    const rule = new DiscountRule({
      name,
      description,
      discountPercentage,
      requiredItems,
      styleMatching,
    })

    await rule.save()
    res.json({ success: true, rule })
  } catch (error) {
    console.error("[FitLook] Error creating discount rule:", error)
    res.status(500).json({ error: "Failed to create discount rule" })
  }
})

// GET: Get all discount rules (with auth)
router.get("/discount-rules", adminAuth, async (req, res) => {
  try {
    const rules = await DiscountRule.find()
    res.json(rules)
  } catch (error) {
    console.error("[FitLook] Error fetching discount rules:", error)
    res.status(500).json({ error: "Failed to fetch discount rules" })
  }
})

// PUT: Update discount rule
router.put("/discount-rules/:ruleId", adminAuth, async (req, res) => {
  try {
    const rule = await DiscountRule.findByIdAndUpdate(req.params.ruleId, req.body, { new: true })
    res.json({ success: true, rule })
  } catch (error) {
    console.error("Error updating discount rule:", error)
    res.status(500).json({ error: "Failed to update discount rule" })
  }
})

// DELETE: Delete discount rule
router.delete("/discount-rules/:ruleId", adminAuth, async (req, res) => {
  try {
    await DiscountRule.findByIdAndDelete(req.params.ruleId)
    res.json({ success: true })
  } catch (error) {
    console.error("Error deleting discount rule:", error)
    res.status(500).json({ error: "Failed to delete discount rule" })
  }
})

// POST: Categorize product
router.post("/categorize-product", adminAuth, async (req, res) => {
  try {
    const { shopifyProductId, title, price, image, category, style, color, complementaryCategories } = req.body

    let product = await ProductCategory.findOne({ shopifyProductId })

    if (!product) {
      product = new ProductCategory({
        shopifyProductId,
        title,
        price,
        image,
        category,
        style,
        color,
        complementaryCategories,
      })
    } else {
      product.category = category
      product.style = style
      product.color = color
      product.complementaryCategories = complementaryCategories
    }

    await product.save()
    res.json({ success: true, product })
  } catch (error) {
    console.error("Error categorizing product:", error)
    res.status(500).json({ error: "Failed to categorize product" })
  }
})

// GET: Get all categorized products
router.get("/products", adminAuth, async (req, res) => {
  try {
    const products = await ProductCategory.find()
    res.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

export default router
