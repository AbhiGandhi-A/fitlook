// User API routes - handle user profile management
import express from "express"
import User from "../models/User.js"

const router = express.Router()

// POST: Create or update user profile
router.post("/profile", async (req, res) => {
  try {
    const { name, height, weight, gender, shoeSize, preferredStyle, uploadedImage, selectedModelImage } = req.body

    // Validate required fields
    if (!name || !height || !weight || !gender || !shoeSize) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Create new user or update existing
    let user = await User.findOne({ email: req.body.email })

    if (!user) {
      user = new User({
        name,
        email: req.body.email || `user_${Date.now()}@fitlook.local`,
        height,
        weight,
        gender,
        shoeSize,
        preferredStyle,
        uploadedImage,
        selectedModelImage,
      })
    } else {
      // Update existing user
      user.name = name
      user.height = height
      user.weight = weight
      user.gender = gender
      user.shoeSize = shoeSize
      user.preferredStyle = preferredStyle
      if (uploadedImage) user.uploadedImage = uploadedImage
      if (selectedModelImage) user.selectedModelImage = selectedModelImage
      user.updatedAt = new Date()
    }

    await user.save()
    res.json({ success: true, user })
  } catch (error) {
    console.error("Error saving user profile:", error)
    res.status(500).json({ error: "Failed to save user profile" })
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
