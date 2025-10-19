// Main Express server entry point
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Import routes
import userRoutes from "./backend/routes/userRoutes.js"
import productRoutes from "./backend/routes/productRoutes.js"
import recommendationRoutes from "./backend/routes/recommendationRoutes.js"
import cartRoutes from "./backend/routes/cartRoutes.js"
import adminRoutes from "./backend/routes/adminRoutes.js"

// Load environment variables
dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, "frontend/build")))

// API Routes
app.use("/api/user", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/recommend", recommendationRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/admin", adminRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "FitLook server is running" })
})

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build/index.html"))
})

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`FitLook server running on port ${PORT}`)
})
