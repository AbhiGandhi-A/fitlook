import express from "express"
import axios from "axios"

const router = express.Router()

// Helper function to create cart using Shopify Storefront API
const createShopifyCart = async (items) => {
  try {
    console.log("[FitLook] Creating Shopify cart with items:", items)

    // Build GraphQL mutation for cart creation
    const cartLines = items
      .map(
        (item) =>
          `{ merchandiseId: "gid://shopify/ProductVariant/${item.variantId}", quantity: ${item.quantity || 1} }`,
      )
      .join(",")

    const query = `
      mutation {
        cartCreate(input: {
          lines: [${cartLines}]
        }) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      { query },
      {
        headers: {
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
          "Content-Type": "application/json",
        },
      },
    )

    if (response.data.errors || response.data.data.cartCreate.userErrors.length > 0) {
      const error = response.data.errors?.[0] || response.data.data.cartCreate.userErrors[0]
      throw new Error(error.message)
    }

    const checkoutUrl = response.data.data.cartCreate.cart.checkoutUrl
    console.log("[FitLook] Cart created successfully:", checkoutUrl)
    return checkoutUrl
  } catch (error) {
    console.error("[FitLook] Error creating cart:", error.message)
    throw error
  }
}

// POST: Add complete outfit to cart
router.post("/add-outfit", async (req, res) => {
  try {
    const { topVariantId, bottomVariantId, shoeVariantId, accessoryVariantIds } = req.body

    // Collect all items
    const items = [
      { variantId: topVariantId, quantity: 1 },
      { variantId: bottomVariantId, quantity: 1 },
    ]

    if (shoeVariantId) {
      items.push({ variantId: shoeVariantId, quantity: 1 })
    }

    if (accessoryVariantIds && accessoryVariantIds.length > 0) {
      accessoryVariantIds.forEach((id) => {
        items.push({ variantId: id, quantity: 1 })
      })
    }

    // Create cart and get checkout URL
    const checkoutUrl = await createShopifyCart(items)

    res.json({
      success: true,
      checkoutUrl,
    })
  } catch (error) {
    console.error("[FitLook] Error adding outfit to cart:", error.message)
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

    const checkoutUrl = await createShopifyCart([{ variantId, quantity }])

    res.json({
      success: true,
      checkoutUrl,
    })
  } catch (error) {
    console.error("[FitLook] Error adding item to cart:", error.message)
    res.status(500).json({ error: "Failed to add item to cart" })
  }
})

export default router
