// Shopify Widget - Embed FitLook in Shopify product pages
// Usage: <div id="fitlook-widget" data-product-id="{{product.id}}"></div>
// <script src="https://cdn.fitlook.ai/widget.js"></script>

;(() => {
  // Configuration
  const FITLOOK_API_URL = "https://fitlook.app" // Change to your domain
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
    const productId = container.getAttribute("data-product-id")

    if (!productId) {
      console.warn("Product ID not provided to FitLook widget")
      return
    }

    // Create iframe for widget
    const iframe = document.createElement("iframe")
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
    setupWidgetCommunication(iframe, productId)
  }

  /**
   * Setup communication between widget and Shopify page
   */
  function setupWidgetCommunication(iframe, productId) {
    window.addEventListener("message", (event) => {
      // Verify origin for security
      if (event.origin !== FITLOOK_API_URL) {
        return
      }

      // Handle add to cart message
      if (event.data.type === "ADD_TO_CART") {
        const { variantId, quantity } = event.data

        // Add to Shopify cart
        fetch("/cart/add.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                id: variantId,
                quantity: quantity || 1,
              },
            ],
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            // Notify widget of success
            iframe.contentWindow.postMessage(
              {
                type: "CART_UPDATED",
                success: true,
              },
              FITLOOK_API_URL,
            )
          })
          .catch((error) => {
            console.error("Error adding to cart:", error)
            iframe.contentWindow.postMessage(
              {
                type: "CART_UPDATED",
                success: false,
                error: error.message,
              },
              FITLOOK_API_URL,
            )
          })
      }
    })
  }
})()
