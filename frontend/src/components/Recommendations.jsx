"use client"

// Component for displaying AI-powered recommendations
import { useState, useEffect, useContext } from "react"
import { FitLookContext } from "../App"
import "../styles/Recommendations.css"

function Recommendations({ selectedProduct }) {
  const { handleSelectItem } = useContext(FitLookContext)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/recommend/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedProductId: selectedProduct.id,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setRecommendations(data.recommendations || [])
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error)
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
            <div key={item._id} className="recommendation-card" onClick={() => handleSelectItem(item, item.category)}>
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
