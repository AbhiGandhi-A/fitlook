"use client"

// Component for virtual try-on with image overlay
import { useContext, useRef, useEffect, useState } from "react"
import { FitLookContext } from "../App"
import "../styles/OutfitPreview.css"

function OutfitPreview() {
  const { userImage, selectedItems, setCurrentStep } = useContext(FitLookContext)
  const canvasRef = useRef(null)
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState(0)

  // Draw outfit preview on canvas
  useEffect(() => {
    if (canvasRef.current && userImage) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      // Load base image
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width
        canvas.height = img.height

        // Draw base image
        ctx.drawImage(img, 0, 0)

        // Draw selected clothing items as overlays
        if (selectedItems.top && selectedItems.top.image) {
          drawClothingItem(ctx, selectedItems.top.image, "top", img.height)
        }

        if (selectedItems.bottom && selectedItems.bottom.image) {
          drawClothingItem(ctx, selectedItems.bottom.image, "bottom", img.height)
        }

        if (selectedItems.shoes && selectedItems.shoes.image) {
          drawClothingItem(ctx, selectedItems.shoes.image, "shoes", img.height)
        }
      }
      img.src = userImage
    }
  }, [userImage, selectedItems])

  // Helper function to draw clothing items on canvas
  const drawClothingItem = (ctx, itemImage, category, imageHeight) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Position based on category
      let y = 0
      const height = imageHeight / 3

      if (category === "top") {
        y = imageHeight * 0.1
      } else if (category === "bottom") {
        y = imageHeight * 0.4
      } else if (category === "shoes") {
        y = imageHeight * 0.75
      }

      // Draw with transparency
      ctx.globalAlpha = 0.8
      ctx.drawImage(img, 0, y, ctx.canvas.width, height)
      ctx.globalAlpha = 1
    }
    img.src = itemImage
  }

  // Check if complete outfit is selected
  const isCompleteOutfit = selectedItems.top && selectedItems.bottom

  // Handle complete outfit purchase
  const handleBuyCompleteOutfit = async () => {
    try {
      const response = await fetch("/api/cart/add-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topVariantId: selectedItems.top.id,
          bottomVariantId: selectedItems.bottom.id,
          shoeVariantId: selectedItems.shoes?.id,
          accessoryVariantIds: selectedItems.accessories.map((a) => a.id),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.cartUrl
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add outfit to cart")
    }
  }

  return (
    <div className="outfit-preview">
      <h2>Your Outfit Preview</h2>

      {/* Canvas for outfit preview */}
      <div className="preview-container">
        <canvas ref={canvasRef} className="preview-canvas" />
      </div>

      {/* Selected items summary */}
      <div className="selected-items-summary">
        <h3>Selected Items</h3>
        {selectedItems.top && (
          <div className="item-summary">
            <span>Top:</span>
            <span>{selectedItems.top.title}</span>
            <span>${selectedItems.top.price}</span>
          </div>
        )}
        {selectedItems.bottom && (
          <div className="item-summary">
            <span>Bottom:</span>
            <span>{selectedItems.bottom.title}</span>
            <span>${selectedItems.bottom.price}</span>
          </div>
        )}
        {selectedItems.shoes && (
          <div className="item-summary">
            <span>Shoes:</span>
            <span>{selectedItems.shoes.title}</span>
            <span>${selectedItems.shoes.price}</span>
          </div>
        )}
      </div>

      {/* Discount banner */}
      {isCompleteOutfit && (
        <div className="discount-banner">
          <h3>Complete the Look!</h3>
          <p>Get 10% off when you buy the complete outfit</p>
          <button className="btn btn-primary" onClick={handleBuyCompleteOutfit}>
            Buy Complete Outfit
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="preview-actions">
        <button className="btn btn-secondary" onClick={() => setCurrentStep("catalog")}>
          Back to Catalog
        </button>
        {!isCompleteOutfit && (
          <button className="btn btn-primary" onClick={() => setCurrentStep("catalog")}>
            Add More Items
          </button>
        )}
      </div>
    </div>
  )
}

export default OutfitPreview
