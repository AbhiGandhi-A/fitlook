import dotenv from "dotenv"
dotenv.config()

// Main Express server entry point
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

// Use relative path to utils/shopifyClient.js
import { validateShopifyConfig } from "./backend/utils/shopifyClient.js"

// Import routes
import userRoutes from "./backend/routes/userRoutes.js"
import productRoutes from "./backend/routes/productRoutes.js"
import recommendationRoutes from "./backend/routes/recommendationRoutes.js"
import cartRoutes from "./backend/routes/cartRoutes.js"
import adminRoutes from "./backend/routes/adminRoutes.js"

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
// FIX 1: CORS Configuration to allow Vercel and Local origins
// ----------------------------------------------------------------------

const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://fitlook.vercel.app", // Your deployed frontend
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`[FitLook|CORS] Blocked request from origin: ${origin}`);
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    // Ensure all necessary headers are allowed
    allowedHeaders: ['Content-Type', 'admin-password'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};

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

// ----------------------------------------------------------------------
// FIX 2: Removed deprecated MongoDB connection options
// ----------------------------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI) // Removed { useNewUrlParser: true, useUnifiedTopology: true }
  .then(() => console.log("[FitLook] MongoDB connected successfully"))
  .catch((err) => {
    console.error("[FitLook] MongoDB connection error:", err.message)
    process.exit(1)
  })
// ----------------------------------------------------------------------


// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`[FitLook] Server running on http://localhost:${PORT}`)
  console.log(`[FitLook] API available at http://localhost:${PORT}/api`)
})