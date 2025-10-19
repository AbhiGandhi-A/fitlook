// Shopify API client for fetching products and managing cart
import axios from "axios"

// Initialize Shopify API client
const shopifyClient = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01`,
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
})

// Fetch all products from Shopify store
export const fetchAllProducts = async () => {
  try {
    console.log("[FitLook] Fetching products from Shopify...")
    const response = await shopifyClient.get("/products.json", {
      params: {
        limit: 250,
        status: "active",
        fields: "id,title,handle,vendor,product_type,variants,images",
      },
    })

    // Format products for frontend
    const formattedProducts = response.data.products.map((product) => ({
      id: product.id,
      shopifyId: product.id,
      title: product.title,
      handle: product.handle,
      vendor: product.vendor,
      productType: product.product_type,
      price: product.variants[0]?.price || "0",
      image: product.images[0]?.src || "",
      images: product.images.map((img) => img.src),
      variants: product.variants.map((v) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        sku: v.sku,
      })),
    }))

    console.log(`[FitLook] Successfully fetched ${formattedProducts.length} products`)
    return formattedProducts
  } catch (error) {
    console.error("[FitLook] Error fetching products from Shopify:", error.message)
    throw new Error("Failed to fetch products from Shopify")
  }
}

// Fetch product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await shopifyClient.get(`/products/${productId}.json`)
    return response.data.product
  } catch (error) {
    console.error("[FitLook] Error fetching product:", error.message)
    throw new Error("Failed to fetch product")
  }
}

// Create cart and add items
export const createShopifyCart = async (items) => {
  try {
    console.log("[FitLook] Creating Shopify cart with items:", items)

    // Format items for Shopify cart
    const cartItems = items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity || 1,
    }))

    // Use Shopify Storefront API for cart creation
    const query = `
      mutation {
        cartCreate(input: {
          lines: [
            ${cartItems.map((item) => `{ merchandiseId: "gid://shopify/ProductVariant/${item.variant_id}", quantity: ${item.quantity} }`).join(",")}
          ]
        }) {
          cart {
            id
            checkoutUrl
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

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    const cartUrl = response.data.data.cartCreate.cart.checkoutUrl
    console.log("[FitLook] Cart created successfully:", cartUrl)
    return cartUrl
  } catch (error) {
    console.error("[FitLook] Error creating cart:", error.message)
    throw new Error("Failed to create cart")
  }
}

// Get product recommendations based on category
export const getProductsByCategory = async (category) => {
  try {
    const response = await shopifyClient.get("/products.json", {
      params: {
        limit: 250,
        status: "active",
      },
    })

    // Filter by product type or vendor
    const filtered = response.data.products.filter(
      (p) =>
        p.product_type.toLowerCase().includes(category.toLowerCase()) ||
        p.vendor.toLowerCase().includes(category.toLowerCase()),
    )

    return filtered.map((product) => ({
      id: product.id,
      title: product.title,
      price: product.variants[0]?.price || "0",
      image: product.images[0]?.src || "",
      productType: product.product_type,
    }))
  } catch (error) {
    console.error("[FitLook] Error fetching products by category:", error.message)
    return []
  }
}

export default shopifyClient
