// Shopify Widget - Embed FitLook in Shopify product pages
// Usage: <div id="fitlook-widget" data-product-id="{{product.id}}"></div>
// <script src="https://cdn.fitlook.ai/widget.js"></script>

;(() => {
  // Configuration
  // NOTE: Ensure this URL matches your deployed React application domain (e.g., Vercel)
  const FITLOOK_API_URL = "https://fitlook.vercel.app" 
  const WIDGET_CONTAINER_ID = "fitlook-widget"

  // Initialize widget when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    initializeFitLookWidget()
  })

  /**
   * Initialize FitLook widget on Shopify product page
   */
  function initializeFitLookWidget() {
    const container = document.getElementById(WIDGET_CONTAINER_ID)

    if (!container) {
      console.warn("FitLook widget container not found")
      return
    }

    // Get product ID from data attribute
    // NOTE: In the liquid template, ensure this is the VARIANT ID, e.g., {{ product.selected_or_first_available_variant.id }}
    const productId = container.getAttribute("data-product-id")

    if (!productId) {
      console.warn("Product ID (variant ID) not provided to FitLook widget")
      return
    }

    // Create iframe for widget
    const iframe = document.createElement("iframe")
    // Pass the current product ID for initialization in widget mode
    iframe.src = `${FITLOOK_API_URL}/widget?productId=${productId}` 
    iframe.style.width = "100%"
    iframe.style.height = "600px"
    iframe.style.border = "none"
    iframe.style.borderRadius = "8px"
    iframe.setAttribute("allow", "camera; microphone")

    // Clear container and append iframe
    container.innerHTML = ""
    container.appendChild(iframe)

    // Setup communication between widget and parent page
    setupWidgetCommunication(iframe)
  }

  /**
   * Handles the actual communication and cart addition logic
   * @param {HTMLIFrameElement} iframe - The embedded widget iframe element
   */
  function setupWidgetCommunication(iframe) {
    window.addEventListener("message", (event) => {
      // Verify origin for security
      if (event.origin !== FITLOOK_API_URL) {
        return
      }
      
      const message = event.data

      // Helper function to send status back to iframe
      const sendStatus = (success, error = null) => {
        iframe.contentWindow.postMessage(
          {
            type: "CART_UPDATED",
            success,
            error,
          },
          FITLOOK_API_URL,
        )
      }

      // 1. Handle single item add to cart (original logic)
      if (message.type === "ADD_TO_CART") {
        const { variantId, quantity } = message

        const items = [{ id: variantId, quantity: quantity || 1 }]
        
        performCartAddition(items, sendStatus)

      } 
      
      // 2. ⭐ NEW: Handle complete outfit add to cart (multiple items) ⭐
      else if (message.type === "ADD_TO_CART_OUTFIT") {
        const { items: outfitItems } = message
        
        if (!outfitItems || outfitItems.length === 0) {
            console.error("No items provided for outfit purchase.")
            sendStatus(false, "No items selected.")
            return
        }
        
        // Map the payload from the iframe to the format Shopify expects
        const items = outfitItems.map(item => ({
            id: item.variantId,
            quantity: item.quantity || 1,
        }))
        
        performCartAddition(items, sendStatus, true) // Pass true to indicate outfit purchase
      }
    })
  }
  
  /**
   * Performs the fetch operation to Shopify's /cart/add.json endpoint.
   */
  function performCartAddition(items, sendStatus, isOutfit = false) {
      
    // Add to Shopify cart
    fetch("/cart/add.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: items }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 422) {
             // Handle specific Shopify errors (e.g., "invalid product variant")
            sendStatus(false, data.description || "Invalid variant or quantity.")
        } else {
            sendStatus(true)
            // Optional: Redirect the main Shopify window to the cart page 
            // only when a complete outfit is bought, to show the discount summary (if applicable)
            if (isOutfit) {
                window.location.href = "/cart"
            }
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error)
        sendStatus(false, error.message)
      })
  }
})()