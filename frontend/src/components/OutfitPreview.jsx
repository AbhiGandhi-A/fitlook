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

        // Draw accessories (simple placeholder logic)
        selectedItems.accessories.forEach(accessory => {
            if (accessory.image) {
                 // For accessories, you might want to adjust position and size
                 // This is a simplified call; actual positioning needs client-side logic
                 drawClothingItem(ctx, accessory.image, "accessory", img.height)
            }
        })
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
      } else if (category === "accessory") {
          // Placeholder position for accessories (e.g., top-right of the image)
          // In a real app, this needs complex positioning based on item type (hat, glasses, necklace)
          y = imageHeight * 0.05
          ctx.drawImage(img, ctx.canvas.width * 0.7, y, ctx.canvas.width * 0.3, height * 0.3)
          return
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

  // Handle complete outfit purchase: Use postMessage for widget integration
  const handleBuyCompleteOutfit = () => {
    // 1. Collect all selected item objects (variants)
    const allItems = [
        selectedItems.top, 
        selectedItems.bottom, 
        selectedItems.shoes, 
        ...selectedItems.accessories
    ].filter(Boolean); // Filter out null items

    if (allItems.length === 0) {
        alert("Please select items for the outfit.");
        return;
    }

    // 2. Prepare items payload for the Shopify cart
    const itemsPayload = allItems.map(item => ({
        // NOTE: Ensure item.id contains the Shopify VARIANT ID, which is required for /cart/add.json
        variantId: item.id, 
        quantity: 1,
    }));
    
    // 3. Post Message to the parent Shopify window
    // The parent window (widget.js) is listening for this message and will handle the /cart/add.json call.
    window.parent.postMessage(
        {
            type: "ADD_TO_CART_OUTFIT", // Use a distinct type for multi-item purchase
            items: itemsPayload,
            // Optionally, include discount logic here if cart API supports it, 
            // but usually Shopify discounts are handled via coupon codes or rules after items are added.
        },
        // IMPORTANT: Replace the origin with your Shopify store domain for security 
        // (e.g., "https://your-store.myshopify.com"). Using "*" is less secure but works universally.
        "*" 
    );
    
    // Optional: Show a success message or redirect after a slight delay
    alert("Outfit added to cart! Redirecting to checkout...");
    // A better approach would be to wait for the "CART_UPDATED" message from widget.js
    
    // For now, redirect to the cart page immediately (assuming widget.js handles the add operation quickly)
    // window.location.href = "YOUR_SHOPIFY_CART_URL";
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
        {selectedItems.accessories.map((item) => (
          <div key={item.id} className="item-summary">
            <span>Accessory:</span>
            <span>{item.title}</span>
            <span>${item.price}</span>
          </div>
        ))}
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