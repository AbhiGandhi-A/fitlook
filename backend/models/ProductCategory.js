// MongoDB model for product category mappings
import mongoose from "mongoose"

const productCategorySchema = new mongoose.Schema({
  // Shopify product ID
  shopifyProductId: {
    type: String,
    required: true,
    unique: true,
  },

  // Product details
  title: String,
  price: Number,
  image: String,

  // Category classification
  category: {
    type: String,
    enum: ["top", "bottom", "shoes", "accessory", "dress", "jacket"],
    required: true,
  },

  // Style tags
  style: [String], // e.g., ['casual', 'formal', 'sporty']
  color: [String],

  // Recommendation metadata
  complementaryCategories: [String], // e.g., ['bottom', 'shoes']

  // Admin notes
  notes: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("ProductCategory", productCategorySchema)
