"use client"

// Component for displaying AI-powered recommendations
import { useState, useEffect, useContext } from "react"
import { FitLookContext } from "../App"
import { getRecommendations } from "../services/apiClient"
import "../styles/Recommendations.css"

function Recommendations({ selectedProduct }) {
  const { handleSelectItem } = useContext(FitLookContext)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        console.log("[FitLook] Fetching recommendations for product:", selectedProduct.id)

        const data = await getRecommendations(selectedProduct.id, { preferredStyle: "casual" })
        console.log("[FitLook] Recommendations received:", data)

        setRecommendations(data || [])
      } catch (error) {
        console.error("[FitLook] Error fetching recommendations:", error)
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
      ) : recommendations.length > 0 ? (
        <div className="recommendations-grid">
          {recommendations.map((item) => (
            <div key={item.id} className="recommendation-card" onClick={() => handleSelectItem(item, item.category)}>
              <img src={item.image || "/placeholder.svg"} alt={item.title} />
              <h4>{item.title}</h4>
              <p className="category">{item.category}</p>
              <p className="price">${item.price}</p>
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
