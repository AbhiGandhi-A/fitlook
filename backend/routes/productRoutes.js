// Product API routes - fetch products from Shopify
import express from "express"
import axios from "axios"
import ProductCategory from "../models/ProductCategory.js"

const router = express.Router()

// Helper function to fetch products from Shopify
const fetchShopifyProducts = async (query = "") => {
  try {
    const shopifyUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json`

    const response = await axios.get(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      params: {
        limit: 250,
        status: "active",
      },
    })

    return response.data.products || []
  } catch (error) {
    console.error("Error fetching from Shopify:", error.message)
    return []
  }
}

// GET: Fetch all products from Shopify
router.get("/shopify/all", async (req, res) => {
  try {
    const products = await fetchShopifyProducts()

    // Format products for frontend
    const formattedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      price: product.variants[0]?.price || 0,
      image: product.image?.src || "",
      handle: product.handle,
      category: "uncategorized", // Will be categorized by admin
    }))

    res.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// GET: Fetch products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params

    // Fetch from MongoDB categorized products
    const products = await ProductCategory.find({ category })
    res.json(products)
  } catch (error) {
    console.error("Error fetching products by category:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// GET: Search products
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ error: "Search query required" })
    }

    // Search in MongoDB categorized products
    const products = await ProductCategory.find({
      $or: [{ title: { $regex: query, $options: "i" } }, { style: { $in: [query] } }, { color: { $in: [query] } }],
    })

    res.json(products)
  } catch (error) {
    console.error("Error searching products:", error)
    res.status(500).json({ error: "Failed to search products" })
  }
})

export default router
