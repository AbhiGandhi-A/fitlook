import express from "express"
import { fetchAllProducts, fetchProductById, getProductsByCategory } from "../utils/shopifyClient.js"

const router = express.Router()

// GET: Fetch all products from Shopify
router.get("/shopify/all", async (req, res) => {
  try {
    const products = await fetchAllProducts()
    res.json(products)
  } catch (error) {
    console.error("[FitLook] Error in /shopify/all:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// GET: Fetch product by ID
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params
    const product = await fetchProductById(productId)
    res.json(product)
  } catch (error) {
    console.error("[FitLook] Error fetching product:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// GET: Fetch products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params
    const products = await getProductsByCategory(category)
    res.json(products)
  } catch (error) {
    console.error("[FitLook] Error fetching by category:", error.message)
    res.status(500).json({ error: error.message })
  }
})

// GET: Search products
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ error: "Search query required" })
    }

    const allProducts = await fetchAllProducts()
    const filtered = allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.productType.toLowerCase().includes(query.toLowerCase()) ||
        p.vendor.toLowerCase().includes(query.toLowerCase()),
    )

    res.json(filtered)
  } catch (error) {
    console.error("[FitLook] Error searching products:", error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
