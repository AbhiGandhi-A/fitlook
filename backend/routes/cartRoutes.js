// Cart API routes - manage shopping cart and Shopify integration
import express from "express"
import axios from "axios"

const router = express.Router()

// Helper function to add items to Shopify cart
const addToShopifyCart = async (variantIds, quantities) => {
  try {
    const shopifyUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/cart/add.json`

    // Format items for Shopify
    const items = variantIds.map((id, index) => ({
      id,
      quantity: quantities[index] || 1,
    }))

    const response = await axios.post(shopifyUrl, { items })
    return response.data
  } catch (error) {
    console.error("Error adding to Shopify cart:", error.message)
    throw error
  }
}

// POST: Add complete outfit to cart
router.post("/add-outfit", async (req, res) => {
  try {
    const { topVariantId, bottomVariantId, shoeVariantId, accessoryVariantIds } = req.body

    // Collect all variant IDs
    const variantIds = [topVariantId, bottomVariantId]
    const quantities = [1, 1]

    if (shoeVariantId) {
      variantIds.push(shoeVariantId)
      quantities.push(1)
    }

    if (accessoryVariantIds && accessoryVariantIds.length > 0) {
      variantIds.push(...accessoryVariantIds)
      accessoryVariantIds.forEach(() => quantities.push(1))
    }

    // Add to Shopify cart
    const cartData = await addToShopifyCart(variantIds, quantities)

    res.json({
      success: true,
      cartUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/cart`,
      cartData,
    })
  } catch (error) {
    console.error("Error adding outfit to cart:", error)
    res.status(500).json({ error: "Failed to add outfit to cart" })
  }
})

// POST: Add single item to cart
router.post("/add-item", async (req, res) => {
  try {
    const { variantId, quantity = 1 } = req.body

    if (!variantId) {
      return res.status(400).json({ error: "Variant ID required" })
    }

    const cartData = await addToShopifyCart([variantId], [quantity])

    res.json({
      success: true,
      cartUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/cart`,
      cartData,
    })
  } catch (error) {
    console.error("Error adding item to cart:", error)
    res.status(500).json({ error: "Failed to add item to cart" })
  }
})

export default router
