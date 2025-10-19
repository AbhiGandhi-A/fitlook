// Main Express server entry point

import dotenv from "dotenv"
dotenv.config()

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import { validateShopifyConfig } from "./utils/shopifyClient.js"

// Import routes
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import recommendationRoutes from "./routes/recommendationRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("[FitLook] Server starting...")
console.log("[FitLook] Environment:", process.env.NODE_ENV)
console.log("[FitLook] MongoDB URI:", process.env.MONGODB_URI ? "Configured" : "NOT SET")
console.log("[FitLook] Shopify Store Domain:", process.env.SHOPIFY_STORE_DOMAIN || "NOT SET")

try {
  validateShopifyConfig()
} catch (error) {
  console.error("[FitLook] Shopify configuration error:", error.message)
  console.error("[FitLook] Please check your .env file and ensure all required variables are set")
  process.exit(1)
}

// ----------------------------------------------------------------------
// UPDATED CORS CONFIGURATION
// ----------------------------------------------------------------------
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000" // Use an env variable for Vercel URL

const corsOptions = {
  // Explicitly allow the frontend origin(s).
  // process.env.FRONTEND_URL should be set to 'https://fitlook.vercel.app' in your Render environment variables.
  origin: FRONTEND_URL, 
  // Allow credentials (if you use cookies/sessions later)
  credentials: true, 
  // Specify all methods used
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // IMPORTANT: Explicitly list all custom headers used in the frontend (e.g., 'admin-password')
  allowedHeaders: ['Content-Type', 'admin-password'], 
};

// Apply the explicit CORS middleware configuration
app.use(cors(corsOptions));
// ----------------------------------------------------------------------

// Middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")))

// API Routes
app.use("/api/user", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/recommend", recommendationRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/admin", adminRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "FitLook server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("[FitLook] MongoDB connected successfully"))
  .catch((err) => {
    console.error("[FitLook] MongoDB connection error:", err.message)
    process.exit(1)
  })

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`[FitLook] Server running on http://localhost:${PORT}`)
  console.log(`[FitLook] API available at http://localhost:${PORT}/api`)
})