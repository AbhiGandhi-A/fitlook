// MongoDB model for discount rules configured by admin
import mongoose from "mongoose"

const discountRuleSchema = new mongoose.Schema({
  // Rule name and description
  name: {
    type: String,
    required: true,
  },
  description: String,

  // Discount details
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  // Conditions for discount
  requiredItems: {
    // e.g., { top: true, bottom: true, shoes: false }
    type: Object,
    default: { top: true, bottom: true },
  },

  // Style matching rules
  styleMatching: {
    // e.g., { casual: ['casual', 'sporty'], formal: ['formal'] }
    type: Object,
  },

  // Active status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("DiscountRule", discountRuleSchema)
