"use client"

import { useContext, useRef, useEffect, useState } from "react"
import { FitLookContext } from "../App"
import { addOutfitToCart, addItemToCart } from "../services/apiClient"
import VirtualTryOnEngine from "../utils/VirtualTryOnEngine"
import "../styles/OutfitPreview.css"

function OutfitPreview() {
  const { userImage, selectedItems, userProfile, setCurrentStep } = useContext(FitLookContext)
  const canvasRef = useRef(null)
  const [discountApplied, setDiscountApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [tryOnEngine, setTryOnEngine] = useState(null)
  const [renderingComplete, setRenderingComplete] = useState(false)

  // Initialize virtual try-on engine
  useEffect(() => {
    if (canvasRef.current && userImage && userProfile) {
      const engine = new VirtualTryOnEngine(canvasRef.current, userProfile)
      setTryOnEngine(engine)

      // Load base image and render outfit
      engine
        .loadBaseImage(userImage)
        .then(() => {
          renderOutfit(engine)
        })
        .catch((err) => {
          console.error("[FitLook] Error loading base image:", err)
        })
    }
  }, [userImage, userProfile])

  // Render outfit on canvas
  const renderOutfit = async (engine) => {
    try {
      setRenderingComplete(false)

      // Apply clothing items in order (top, bottom, shoes, accessories)
      if (selectedItems.top) {
        await engine.applyClothing(selectedItems.top, "top")
      }

      if (selectedItems.bottom) {
        await engine.applyClothing(selectedItems.bottom, "bottom")
      }

      if (selectedItems.shoes) {
        await engine.applyClothing(selectedItems.shoes, "shoes")
      }

      // Apply accessories
      for (const accessory of selectedItems.accessories) {
        await engine.applyClothing(accessory, "accessory")
      }

      setRenderingComplete(true)
    } catch (error) {
      console.error("[FitLook] Error rendering outfit:", error)
    }
  }

  // Re-render when selected items change
  useEffect(() => {
    if (tryOnEngine && renderingComplete) {
      tryOnEngine.resetCanvas()
      renderOutfit(tryOnEngine)
    }
  }, [selectedItems])

  // Calculate total price
  useEffect(() => {
    let total = 0
    if (selectedItems.top) total += Number.parseFloat(selectedItems.top.price || 0)
    if (selectedItems.bottom) total += Number.parseFloat(selectedItems.bottom.price || 0)
    if (selectedItems.shoes) total += Number.parseFloat(selectedItems.shoes.price || 0)
    selectedItems.accessories.forEach((acc) => {
      total += Number.parseFloat(acc.price || 0)
    })
    setTotalPrice(total)
  }, [selectedItems])

  // Check if complete outfit is selected
  const isCompleteOutfit = selectedItems.top && selectedItems.bottom

  // Calculate discount
  const discountAmount = isCompleteOutfit ? totalPrice * 0.1 : 0
  const finalPrice = totalPrice - discountAmount

  // Handle complete outfit purchase
  const handleBuyCompleteOutfit = async () => {
    setLoading(true)
    try {
      const topVariantId = selectedItems.top.variants?.[0]?.id || selectedItems.top.id
      const bottomVariantId = selectedItems.bottom.variants?.[0]?.id || selectedItems.bottom.id
      const shoeVariantId = selectedItems.shoes?.variants?.[0]?.id || selectedItems.shoes?.id
      const accessoryVariantIds = selectedItems.accessories.map((a) => a.variants?.[0]?.id || a.id)

      const result = await addOutfitToCart(topVariantId, bottomVariantId, shoeVariantId, accessoryVariantIds)

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error("[FitLook] Error adding to cart:", error)
      alert("Failed to add outfit to cart: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle single item purchase
  const handleBuySingleItem = async (item, category) => {
    setLoading(true)
    try {
      const variantId = item.variants?.[0]?.id || item.id
      const result = await addItemToCart(variantId, 1)

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error("[FitLook] Error adding item to cart:", error)
      alert("Failed to add item to cart: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="outfit-preview">
      <h2>Your Virtual Try-On</h2>

      {/* Canvas for outfit preview */}
      <div className="preview-container">
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} className="preview-canvas" />
          {!renderingComplete && (
            <div className="rendering-indicator">
              <p>Rendering your outfit...</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected items summary */}
      <div className="selected-items-summary">
        <h3>Selected Items</h3>
        {selectedItems.top && (
          <div className="item-summary">
            <span className="item-label">Top:</span>
            <span className="item-name">{selectedItems.top.title}</span>
            <span className="item-price">${Number.parseFloat(selectedItems.top.price).toFixed(2)}</span>
          </div>
        )}
        {selectedItems.bottom && (
          <div className="item-summary">
            <span className="item-label">Bottom:</span>
            <span className="item-name">{selectedItems.bottom.title}</span>
            <span className="item-price">${Number.parseFloat(selectedItems.bottom.price).toFixed(2)}</span>
          </div>
        )}
        {selectedItems.shoes && (
          <div className="item-summary">
            <span className="item-label">Shoes:</span>
            <span className="item-name">{selectedItems.shoes.title}</span>
            <span className="item-price">${Number.parseFloat(selectedItems.shoes.price).toFixed(2)}</span>
          </div>
        )}
        {selectedItems.accessories.length > 0 && (
          <div className="item-summary">
            <span className="item-label">Accessories:</span>
            <span className="item-name">{selectedItems.accessories.length} item(s)</span>
            <span className="item-price">
              ${selectedItems.accessories.reduce((sum, a) => sum + Number.parseFloat(a.price || 0), 0).toFixed(2)}
            </span>
          </div>
        )}

        {/* Price Summary */}
        <div className="price-summary">
          <div className="price-row">
            <span>Subtotal:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          {isCompleteOutfit && (
            <div className="price-row discount">
              <span>Complete Outfit Discount (10%):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="price-row total">
            <span>Total:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Discount banner */}
      {isCompleteOutfit && (
        <div className="discount-banner">
          <h3>Complete the Look!</h3>
          <p>You're getting 10% off this complete outfit</p>
          <button className="btn btn-primary" onClick={handleBuyCompleteOutfit} disabled={loading}>
            {loading ? "Processing..." : "Buy Complete Outfit"}
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="preview-actions">
        <button className="btn btn-secondary" onClick={() => setCurrentStep("catalog")} disabled={loading}>
          Back to Catalog
        </button>
        {!isCompleteOutfit && (
          <button className="btn btn-primary" onClick={() => setCurrentStep("catalog")} disabled={loading}>
            Add More Items
          </button>
        )}
      </div>
    </div>
  )
}

export default OutfitPreview
