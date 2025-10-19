"use client"

import { useState, useEffect, useContext } from "react"
import { FitLookContext } from "../App"
import { fetchAllProducts, getRecommendations } from "../services/apiClient"
import Recommendations from "./Recommendations"
import "../styles/ProductCatalog.css"

function ProductCatalog() {
  const { setCurrentStep, handleSelectItem } = useContext(FitLookContext)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("top")
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Fetch products from Shopify via backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log("[FitLook] Fetching products from Shopify...")
        const data = await fetchAllProducts()
        console.log("[FitLook] Products fetched:", data.length)
        setProducts(data)
        filterProductsByCategory(data, selectedCategory)
      } catch (error) {
        console.error("[FitLook] Error fetching products:", error)
        alert("Failed to load products. Please check your Shopify connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products by category based on Shopify product type
  const filterProductsByCategory = (allProducts, category) => {
    const filtered = allProducts.filter((p) => {
      const productType = p.productType.toLowerCase()
      switch (category) {
        case "top":
          return productType.includes("shirt") || productType.includes("top") || productType.includes("dress")
        case "bottom":
          return productType.includes("pant") || productType.includes("jean") || productType.includes("bottom")
        case "shoes":
          return productType.includes("shoe") || productType.includes("footwear")
        case "accessory":
          return productType.includes("accessory") || productType.includes("belt") || productType.includes("bag")
        default:
          return true
      }
    })
    setFilteredProducts(filtered)
  }

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    filterProductsByCategory(products, category)
    setSelectedProduct(null)
    setShowRecommendations(false)
  }

  // Handle product selection and fetch recommendations
  const handleProductSelect = async (product) => {
    setSelectedProduct(product)
    handleSelectItem(product, selectedCategory)

    try {
      await getRecommendations(product.id, { preferredStyle: "casual" })
      setShowRecommendations(true)
    } catch (error) {
      console.error("[FitLook] Error fetching recommendations:", error)
    }
  }

  return (
    <div className="product-catalog">
      <h2>Select Your Outfit</h2>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === "top" ? "active" : ""}`}
          onClick={() => handleCategoryChange("top")}
        >
          Tops
        </button>
        <button
          className={`category-btn ${selectedCategory === "bottom" ? "active" : ""}`}
          onClick={() => handleCategoryChange("bottom")}
        >
          Bottoms
        </button>
        <button
          className={`category-btn ${selectedCategory === "shoes" ? "active" : ""}`}
          onClick={() => handleCategoryChange("shoes")}
        >
          Shoes
        </button>
        <button
          className={`category-btn ${selectedCategory === "accessory" ? "active" : ""}`}
          onClick={() => handleCategoryChange("accessory")}
        >
          Accessories
        </button>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {loading ? (
          <p className="loading-text">Loading products from your Shopify store...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`product-card ${selectedProduct?.id === product.id ? "selected" : ""}`}
              onClick={() => handleProductSelect(product)}
            >
              <img src={product.image || "/placeholder.svg?height=200&width=200"} alt={product.title} />
              <h3>{product.title}</h3>
              <p className="price">${Number.parseFloat(product.price).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p className="no-products">No products found in this category</p>
        )}
      </div>

      {/* Recommendations */}
      {showRecommendations && selectedProduct && <Recommendations selectedProduct={selectedProduct} />}

      {/* Navigation Buttons */}
      <div className="catalog-actions">
        <button className="btn btn-secondary" onClick={() => setCurrentStep("details")}>
          Back
        </button>
        <button className="btn btn-primary" onClick={() => setCurrentStep("preview")} disabled={!selectedProduct}>
          Preview Outfit
        </button>
      </div>
    </div>
  )
}

export default ProductCatalog
