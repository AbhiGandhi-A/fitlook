"use client"

import { useState, useEffect, useContext } from "react"
import { FitLookContext } from "../App"
import { getRecommendations } from "../services/apiClient"
import "../styles/Recommendations.css"

function Recommendations({ selectedProduct }) {
  const { handleSelectItem } = useContext(FitLookContext)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!selectedProduct || !selectedProduct.id) {
          console.log("[FitLook] No product selected for recommendations")
          setRecommendations([])
          setLoading(false)
          return
        }

        console.log("[FitLook] Fetching recommendations for product:", selectedProduct.id)

        const data = await getRecommendations(selectedProduct.id, { preferredStyle: "casual" })

        console.log("[FitLook] Recommendations received:", data)

        // Handle both direct array and object with recommendations property
        const recs = Array.isArray(data) ? data : data?.recommendations || []
        setRecommendations(recs)
      } catch (error) {
        console.error("[FitLook] Error fetching recommendations:", error)
        setError(error.message)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    if (selectedProduct) {
      fetchRecommendations()
    }
  }, [selectedProduct])

  return (
    <div className="recommendations-section">
      <h3>Recommended Items</h3>
      {loading ? (
        <p>Loading recommendations...</p>
      ) : error ? (
        <p className="error">Error loading recommendations: {error}</p>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-grid">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="recommendation-card"
              onClick={() => {
                let category = "accessory"
                const type = item.productType?.toLowerCase() || ""
                if (type.includes("shirt") || type.includes("top") || type.includes("dress")) {
                  category = "top"
                } else if (type.includes("pant") || type.includes("jean") || type.includes("bottom")) {
                  category = "bottom"
                } else if (type.includes("shoe") || type.includes("footwear")) {
                  category = "shoes"
                }
                handleSelectItem(item, category)
              }}
            >
              <img src={item.image || "/placeholder.svg"} alt={item.title} />
              <h4>{item.title}</h4>
              <p className="category">{item.productType}</p>
              <p className="price">${Number.parseFloat(item.price || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No recommendations available</p>
      )}
    </div>
  )
}

export default Recommendations
