// Main Express server entry point
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Import routes (Ensure these files exist in ./backend/routes/)
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

// 1. Serve static files from frontend build
app.use(express.static(path.join(__dirname, "frontend/build")))

// 2. API Routes
// These must be defined BEFORE the catch-all for the React index.html
app.use("/api/user", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/recommend", recommendationRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/admin", adminRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "FitLook server is running" })
})

// ⭐ FIX: Explicitly handle the widget path for the iframe source
app.get("/widget", (req, res) => {
  // This serves the React app's entry point for the iframe
  res.sendFile(path.join(__dirname, "frontend/build/index.html"))
})


// 3. Serve React app for all other GET routes (The final catch-all)
// We must ensure this does not catch POST requests to /api/
app.use((req, res) => {
    // If the request URL starts with /api/, it means no API route matched (404 API)
    // or it's a method other than GET (like POST) that should've been handled above.
    // However, for a robust SPA catch-all, we rely on the Vercel routing to handle /api.
    // This part should only serve the index.html for unknown frontend routes.
    
    // For simplicity and to fix the 404 issue caused by the original placement:
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