// This engine now removes product backgrounds, detects user body regions, and composites clothing realistically

class VirtualTryOnEngine {
  constructor(canvas, userProfile) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.userProfile = userProfile
    this.baseImage = null
    this.baseImageData = null
    this.bodyRegions = null
    this.clothingLayers = []
  }

  // Load base image and detect body regions using advanced image analysis
  async loadBaseImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Set canvas size to match image
        this.canvas.width = img.width
        this.canvas.height = img.height

        // Draw base image
        this.ctx.drawImage(img, 0, 0)
        this.baseImage = img

        // Store base image data for reference
        this.baseImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

        // Detect body regions using advanced analysis
        this.detectBodyRegionsAdvanced()

        console.log("[FitLook] Base image loaded and body regions detected")
        resolve()
      }

      img.onerror = () => {
        reject(new Error("Failed to load base image"))
      }

      img.src = imageUrl
    })
  }

  // Advanced body region detection using color and edge analysis
  detectBodyRegionsAdvanced() {
    const width = this.canvas.width
    const height = this.canvas.height
    const imageData = this.baseImageData
    const data = imageData.data

    // Find skin tone regions to detect body parts
    const skinPixels = this.findSkinToneRegions(data, width, height)

    // Calculate body bounding box
    let minY = height,
      maxY = 0,
      minX = width,
      maxX = 0

    for (let i = 0; i < skinPixels.length; i++) {
      const pixel = skinPixels[i]
      minY = Math.min(minY, pixel.y)
      maxY = Math.max(maxY, pixel.y)
      minX = Math.min(minX, pixel.x)
      maxX = Math.max(maxX, pixel.x)
    }

    const bodyHeight = maxY - minY
    const bodyWidth = maxX - minX

    // Define body regions based on detected body position
    this.bodyRegions = {
      head: {
        x: minX,
        y: minY,
        width: bodyWidth,
        height: bodyHeight * 0.15,
      },
      torso: {
        x: minX + bodyWidth * 0.1,
        y: minY + bodyHeight * 0.15,
        width: bodyWidth * 0.8,
        height: bodyHeight * 0.35,
      },
      waist: {
        x: minX + bodyWidth * 0.05,
        y: minY + bodyHeight * 0.5,
        width: bodyWidth * 0.9,
        height: bodyHeight * 0.05,
      },
      legs: {
        x: minX + bodyWidth * 0.1,
        y: minY + bodyHeight * 0.55,
        width: bodyWidth * 0.8,
        height: bodyHeight * 0.3,
      },
      feet: {
        x: minX + bodyWidth * 0.15,
        y: minY + bodyHeight * 0.85,
        width: bodyWidth * 0.7,
        height: bodyHeight * 0.15,
      },
    }

    console.log("[FitLook] Body regions detected:", this.bodyRegions)
  }

  // Find skin tone regions in the image
  findSkinToneRegions(data, width, height) {
    const skinPixels = []

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Skin tone detection (adjust ranges based on actual skin tones)
      if (this.isSkinTone(r, g, b) && a > 200) {
        const pixelIndex = i / 4
        const y = Math.floor(pixelIndex / width)
        const x = pixelIndex % width
        skinPixels.push({ x, y })
      }
    }

    return skinPixels
  }

  // Check if a pixel is likely skin tone
  isSkinTone(r, g, b) {
    // Skin tone ranges (can be adjusted for different skin tones)
    const rRange = r > 95 && r < 220
    const gRange = g > 40 && g < 200
    const bRange = b > 20 && b < 170

    // Additional checks for skin tone
    const rGreaterG = r > g
    const rGreaterB = r > b
    const gGreaterB = g > b

    return rRange && gRange && bRange && rGreaterG && rGreaterB && gGreaterB
  }

  // Remove white/light background from product image
  async removeProductBackground(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Create temporary canvas for processing
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        const tempCtx = tempCanvas.getContext("2d")

        // Draw image
        tempCtx.drawImage(img, 0, 0)

        // Get image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
        const data = imageData.data

        // Remove white/light background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          // If pixel is very light (white/light gray background), make it transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0 // Set alpha to 0 (transparent)
          }
          // Also handle slightly off-white backgrounds
          else if (r > 220 && g > 220 && b > 220 && a > 200) {
            data[i + 3] = Math.max(0, a - 100)
          }
        }

        // Put processed image data back
        tempCtx.putImageData(imageData, 0, 0)

        // Convert to data URL
        const processedImageUrl = tempCanvas.toDataURL("image/png")
        resolve(processedImageUrl)
      }

      img.onerror = () => {
        reject(new Error("Failed to load product image for background removal"))
      }

      img.src = imageUrl
    })
  }

  // Apply clothing item with background removal and proper positioning
  async applyClothing(item, category) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = async () => {
        try {
          // Remove background from product image
          const processedImageUrl = await this.removeProductBackground(img.src)

          // Load processed image
          const processedImg = new Image()
          processedImg.crossOrigin = "anonymous"

          processedImg.onload = () => {
            try {
              const region = this.getRegionForCategory(category)

              // Calculate scaling to fit the region
              const scale = Math.min(region.width / processedImg.width, region.height / processedImg.height)

              const scaledWidth = processedImg.width * scale
              const scaledHeight = processedImg.height * scale

              // Center the clothing in the region
              const x = region.x + (region.width - scaledWidth) / 2
              const y = region.y + (region.height - scaledHeight) / 2

              // Draw clothing with proper blending
              this.ctx.globalAlpha = 0.95
              this.ctx.globalCompositeOperation = "source-over"
              this.ctx.drawImage(processedImg, x, y, scaledWidth, scaledHeight)
              this.ctx.globalAlpha = 1
              this.ctx.globalCompositeOperation = "source-over"

              // Store clothing layer info
              this.clothingLayers.push({
                category,
                item,
                x,
                y,
                width: scaledWidth,
                height: scaledHeight,
              })

              console.log(`[FitLook] Applied ${category}: ${item.title}`)
              resolve()
            } catch (error) {
              reject(error)
            }
          }

          processedImg.onerror = () => {
            reject(new Error(`Failed to load processed ${category} image`))
          }

          processedImg.src = processedImageUrl
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error(`Failed to load ${category} image`))
      }

      img.src = item.image
    })
  }

  // Get body region for clothing category
  getRegionForCategory(category) {
    const regions = this.bodyRegions

    switch (category) {
      case "top":
        // Torso region for shirts, tops, jackets
        return {
          x: regions.torso.x,
          y: regions.torso.y,
          width: regions.torso.width,
          height: regions.torso.height,
        }
      case "bottom":
        // Legs and waist region for pants, jeans, skirts
        return {
          x: regions.legs.x,
          y: regions.waist.y,
          width: regions.legs.width,
          height: regions.legs.height + regions.waist.height,
        }
      case "shoes":
        // Feet region for shoes
        return {
          x: regions.feet.x,
          y: regions.feet.y,
          width: regions.feet.width,
          height: regions.feet.height,
        }
      case "accessory":
        // Wrist/arm area for accessories
        return {
          x: regions.torso.x + regions.torso.width * 0.65,
          y: regions.torso.y + regions.torso.height * 0.75,
          width: regions.torso.width * 0.3,
          height: regions.torso.height * 0.25,
        }
      default:
        return regions.torso
    }
  }

  // Clear canvas and redraw base image
  resetCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.baseImage) {
      this.ctx.drawImage(this.baseImage, 0, 0)
    }
    this.clothingLayers = []
  }

  // Export canvas as image
  exportOutfit() {
    return this.canvas.toDataURL("image/png")
  }
}

export default VirtualTryOnEngine
