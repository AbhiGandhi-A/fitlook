"use client"

// Component for displaying Shopify products in a grid
import { useState, useEffect, useContext } from "react"
import { FitLookContext } from "../App"
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

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/products/shopify/all")
        const data = await response.json()
        setProducts(data)
        filterProductsByCategory(data, selectedCategory)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products by category
  const filterProductsByCategory = (allProducts, category) => {
    const filtered = allProducts.filter((p) => p.category === category)
    setFilteredProducts(filtered)
  }

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    filterProductsByCategory(products, category)
    setSelectedProduct(null)
    setShowRecommendations(false)
  }

  // Handle product selection
  const handleProductSelect = async (product) => {
    setSelectedProduct(product)
    handleSelectItem(product, selectedCategory)

    // Fetch recommendations
    try {
      const response = await fetch("/api/recommend/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedProductId: product.id,
          userPreferences: { preferredStyle: "casual" },
        }),
      })

      if (response.ok) {
        setShowRecommendations(true)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
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
          <p>Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`product-card ${selectedProduct?.id === product.id ? "selected" : ""}`}
              onClick={() => handleProductSelect(product)}
            >
              <img src={product.image || "/placeholder.svg"} alt={product.title} />
              <h3>{product.title}</h3>
              <p className="price">${product.price}</p>
            </div>
          ))
        ) : (
          <p>No products found in this category</p>
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
