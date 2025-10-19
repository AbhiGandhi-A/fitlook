// User API routes - handle user profile management
import express from "express"
import User from "../models/User.js"

const router = express.Router()

// POST: Create or update user profile
router.post("/profile", async (req, res) => {
  try {
    const { 
        name, 
        email, // <-- Explicitly destructure email
        height, 
        weight, 
        gender, 
        shoeSize, 
        preferredStyle, 
        uploadedImage, 
        selectedModelImage 
    } = req.body

    // 1. Validate required fields (including email for identification)
    if (!email || !name || !height || !weight || !gender || !shoeSize) {
      return res.status(400).json({ error: "Missing required fields (email, name, height, weight, gender, shoeSize)" })
    }

    // 2. Use findOneAndUpdate with upsert: true for atomic creation/update
    // This is generally cleaner and less prone to race conditions than separate findOne and save calls.
    const updateData = {
      name,
      height,
      weight,
      gender,
      shoeSize,
      preferredStyle,
      // Only update image fields if they are explicitly present in the body
      ...(uploadedImage && { uploadedImage }), 
      ...(selectedModelImage && { selectedModelImage }),
      updatedAt: new Date()
    }

    const user = await User.findOneAndUpdate(
        { email: email }, // Query by email (assuming it's the unique key)
        { $set: updateData },
        { 
            new: true,         // Return the updated document
            upsert: true,      // Create the document if it doesn't exist
            runValidators: true // Run Mongoose schema validation
        }
    )

    // 3. Successful response
    res.status(200).json({ success: true, user })
  } catch (error) {
    console.error("Error saving user profile:", error)
    
    // Check for Mongoose validation error (e.g., malformed field type)
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message, details: error.errors })
    }
    // Check for MongoDB duplicate key error (e.g., if another unique field failed)
    if (error.code && error.code === 11000) {
        return res.status(409).json({ error: 'Profile already exists or unique field constraint violated.' });
    }

    // Generic 500 fallback
    res.status(500).json({ error: "Failed to save user profile due to a server error" })
  }
})

// GET: Retrieve user profile by ID
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// GET: Get all users (for admin)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-uploadedImage") // Exclude large image data
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

export default router