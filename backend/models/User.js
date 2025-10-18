// MongoDB User model - stores user profile and preferences
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },

  // Body measurements
  height: {
    type: Number, // in cm
    required: true,
  },
  weight: {
    type: Number, // in kg
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  shoeSize: {
    type: String,
    required: true,
  },
  bodyType: {
    type: String,
    enum: ["slim", "athletic", "average", "curvy", "plus"],
    default: "average",
  },

  // Style preferences
  preferredStyle: {
    type: String,
    enum: ["casual", "formal", "party", "traditional", "sporty"],
    default: "casual",
  },
  favoriteColors: [String],

  // Image storage
  uploadedImage: {
    type: String, // base64 or URL
  },
  selectedModelImage: {
    type: String, // URL to model image
  },

  // Outfit history
  previousOutfits: [
    {
      topId: String,
      bottomId: String,
      accessoryIds: [String],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("User", userSchema)
