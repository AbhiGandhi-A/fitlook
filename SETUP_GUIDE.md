# FitLook - Complete Setup & Integration Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Shopify Integration](#shopify-integration)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

**FitLook** is a full-stack MERN application that provides:
- AI-powered outfit recommendations
- Virtual try-on with image overlay
- Shopify store integration
- User profile management
- Admin panel for discount configuration
- Complete outfit purchase with discounts

### Tech Stack
- **Frontend**: React (JSX), Plain CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **External APIs**: Shopify REST/GraphQL API

---

## Prerequisites

Before starting, ensure you have:
- Node.js (v14+) and npm installed
- MongoDB running locally or MongoDB Atlas account
- Shopify store with API credentials
- Git (optional, for version control)

### Install Node.js
Download from: https://nodejs.org/

### Setup MongoDB
- **Local**: Download from https://www.mongodb.com/try/download/community
- **Cloud**: Create account at https://www.mongodb.com/cloud/atlas

### Get Shopify API Credentials
1. Go to your Shopify Admin Dashboard
2. Navigate to Settings → Apps and integrations → Develop apps
3. Create a new app and generate API credentials
4. Note down: Store Domain, API Key, API Password, Access Token

---

## Installation & Setup

### Step 1: Clone or Download Project
\`\`\`bash
# If using git
git clone <repository-url>
cd fitlook-app

# Or extract the downloaded ZIP file
\`\`\`

### Step 2: Install Backend Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 3: Install Frontend Dependencies
\`\`\`bash
cd frontend
npm install
cd ..
\`\`\`

### Step 4: Create Environment File
Create a `.env` file in the root directory:

\`\`\`env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fitlook

# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_PASSWORD=your_api_password_here
SHOPIFY_ACCESS_TOKEN=your_access_token_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Admin Credentials
ADMIN_EMAIL=admin@fitlook.com
ADMIN_PASSWORD=admin123
\`\`\`

---

## Configuration

### MongoDB Setup

#### Option 1: Local MongoDB
\`\`\`bash
# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Or on Windows, MongoDB should start automatically
\`\`\`

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitlook
\`\`\`

### Shopify Configuration

1. **Get Store Domain**:
   - Format: `your-store.myshopify.com`
   - Found in Shopify Admin → Settings → General

2. **Generate API Credentials**:
   - Admin → Apps and integrations → Develop apps
   - Create new app
   - Configure Admin API scopes:
     - `read_products`
     - `write_products`
     - `read_orders`
     - `write_orders`
   - Generate access token

3. **Update `.env`** with credentials

---

## Running the Application

### Development Mode

#### Terminal 1: Start Backend Server
\`\`\`bash
npm run dev
\`\`\`
Server runs on: `http://localhost:5000`

#### Terminal 2: Start Frontend Development Server
\`\`\`bash
cd frontend
npm start
\`\`\`
Frontend runs on: `http://localhost:3000`

### Production Mode

#### Build Frontend
\`\`\`bash
cd frontend
npm run build
cd ..
\`\`\`

#### Start Server
\`\`\`bash
npm start
\`\`\`
App runs on: `http://localhost:5000`

---

## Shopify Integration

### Method 1: Embed Widget in Product Page

#### Step 1: Add Widget Container
In your Shopify product template (e.g., `product.liquid`):

\`\`\`html
<div id="fitlook-widget" data-product-id="{{product.id}}"></div>
<script src="https://your-fitlook-domain.com/widget.js"></script>
\`\`\`

#### Step 2: Configure Widget
Update `widget.js` with your FitLook domain:
\`\`\`javascript
const FITLOOK_API_URL = 'https://your-fitlook-domain.com';
\`\`\`

#### Step 3: Deploy Widget
- Host `widget.js` on your FitLook server
- Or use a CDN like Vercel, Netlify

### Method 2: Full Integration

1. **Create Shopify App** (Advanced)
   - Use Shopify CLI
   - Integrate FitLook as embedded app
   - Publish to Shopify App Store

2. **API Endpoints for Shopify**
   - `/api/products/shopify/all` - Fetch all products
   - `/api/cart/add-outfit` - Add items to cart
   - `/api/recommend/get` - Get recommendations

---

## API Documentation

### User Endpoints

#### POST `/api/user/profile`
Save or update user profile
\`\`\`json
{
  "name": "John Doe",
  "height": 180,
  "weight": 75,
  "gender": "male",
  "shoeSize": "42",
  "preferredStyle": "casual",
  "uploadedImage": "base64_image_data"
}
\`\`\`

#### GET `/api/user/:userId`
Retrieve user profile

### Product Endpoints

#### GET `/api/products/shopify/all`
Fetch all products from Shopify

#### GET `/api/products/category/:category`
Fetch products by category (top, bottom, shoes, accessory)

#### GET `/api/products/search?query=shirt`
Search products

### Recommendation Endpoints

#### POST `/api/recommend/get`
Get recommendations for selected product
\`\`\`json
{
  "selectedProductId": "product_id",
  "userPreferences": {
    "preferredStyle": "casual"
  }
}
\`\`\`

#### POST `/api/recommend/complete-outfit`
Get complete outfit recommendations
\`\`\`json
{
  "topId": "top_product_id",
  "bottomId": "bottom_product_id",
  "userPreferences": {}
}
\`\`\`

### Cart Endpoints

#### POST `/api/cart/add-outfit`
Add complete outfit to Shopify cart
\`\`\`json
{
  "topVariantId": "variant_id",
  "bottomVariantId": "variant_id",
  "shoeVariantId": "variant_id",
  "accessoryVariantIds": ["variant_id_1", "variant_id_2"]
}
\`\`\`

#### POST `/api/cart/add-item`
Add single item to cart
\`\`\`json
{
  "variantId": "variant_id",
  "quantity": 1
}
\`\`\`

### Admin Endpoints

#### POST `/api/admin/discount-rules`
Create discount rule (requires admin password)
\`\`\`json
{
  "name": "Complete Outfit Discount",
  "description": "10% off when buying top + bottom",
  "discountPercentage": 10,
  "requiredItems": {
    "top": true,
    "bottom": true
  }
}
\`\`\`

#### GET `/api/admin/discount-rules`
Get all discount rules

#### PUT `/api/admin/discount-rules/:ruleId`
Update discount rule

#### DELETE `/api/admin/discount-rules/:ruleId`
Delete discount rule

#### POST `/api/admin/categorize-product`
Categorize Shopify product
\`\`\`json
{
  "shopifyProductId": "product_id",
  "title": "Blue Shirt",
  "price": 49.99,
  "image": "image_url",
  "category": "top",
  "style": ["casual", "formal"],
  "color": ["blue"],
  "complementaryCategories": ["bottom", "shoes"]
}
\`\`\`

---

## Project Structure

\`\`\`
fitlook-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── DiscountRule.js
│   │   └── ProductCategory.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── cartRoutes.js
│   │   └── adminRoutes.js
│   └── utils/
│       └── recommender.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserDetailsForm.jsx
│   │   │   ├── ProductCatalog.jsx
│   │   │   ├── OutfitPreview.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── App.css
│   │   │   ├── UserDetailsForm.css
│   │   │   ├── ProductCatalog.css
│   │   │   ├── Recommendations.css
│   │   │   ├── OutfitPreview.css
│   │   │   └── AdminPanel.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
├── server.js
├── package.json
├── .env
├── widget.js
└── SETUP_GUIDE.md
\`\`\`

---

## Troubleshooting

### MongoDB Connection Error
\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:27017
\`\`\`
**Solution**: Ensure MongoDB is running
\`\`\`bash
# macOS
brew services start mongodb-community

# Windows
# Start MongoDB from Services or run mongod.exe
\`\`\`

### Shopify API Error
\`\`\`
Error: Invalid API credentials
\`\`\`
**Solution**: 
- Verify credentials in `.env`
- Check API scopes are enabled
- Ensure access token is valid

### CORS Error
\`\`\`
Access to XMLHttpRequest blocked by CORS policy
\`\`\`
**Solution**: Ensure CORS middleware is enabled in `server.js`

### Port Already in Use
\`\`\`
Error: listen EADDRINUSE: address already in use :::5000
\`\`\`
**Solution**: 
\`\`\`bash
# Change PORT in .env
PORT=5001

# Or kill process using port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
\`\`\`

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure frontend server is running on port 3000
- Check browser console for errors

---

## Sample Data for Testing

### Test User Profile
\`\`\`json
{
  "name": "Alex Johnson",
  "height": 175,
  "weight": 70,
  "gender": "male",
  "shoeSize": "42",
  "preferredStyle": "casual"
}
\`\`\`

### Test Product
\`\`\`json
{
  "shopifyProductId": "123456789",
  "title": "Classic Blue Shirt",
  "price": 49.99,
  "image": "https://example.com/shirt.jpg",
  "category": "top",
  "style": ["casual", "formal"],
  "color": ["blue"],
  "complementaryCategories": ["bottom", "shoes"]
}
\`\`\`

---

## Deployment

### Deploy to Vercel (Recommended)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

### Deploy to Heroku
\`\`\`bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create fitlook-app
git push heroku main
\`\`\`

### Deploy to AWS/DigitalOcean
- Use PM2 for process management
- Setup Nginx as reverse proxy
- Configure SSL certificate

---

## Support & Documentation

- **Shopify API Docs**: https://shopify.dev/api
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/

---

## License

MIT License - Feel free to use for personal and commercial projects.

---

**Last Updated**: October 2024
**Version**: 1.0.0
