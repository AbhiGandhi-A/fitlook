"use client"

// FitLook Preview Page - Entry point for v0 preview
// This page displays the FitLook application interface
// For full functionality, run the backend server separately

import { useState, createContext } from "react"
import "./page.css"

// Create context for managing app state
export const FitLookContext = createContext()

export default function Page() {
  // State management
  const [currentStep, setCurrentStep] = useState("welcome")
  const [userProfile, setUserProfile] = useState(null)
  const [selectedItems, setSelectedItems] = useState({
    top: null,
    bottom: null,
    shoes: null,
    accessories: [],
  })
  const [userImage, setUserImage] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    height: "",
    weight: "",
    gender: "male",
    shoeSize: "",
    preferredStyle: "casual",
    image: null,
    imagePreview: null,
  })

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          imagePreview: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle user profile submission
  const handleUserProfileSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.height || !formData.weight || !formData.shoeSize) {
      alert("Please fill in all required fields")
      return
    }
    if (!formData.image) {
      alert("Please upload or select an image")
      return
    }
    setUserProfile(formData)
    setUserImage(formData.image)
    setCurrentStep("catalog")
  }

  // Handle item selection
  const handleSelectItem = (item, category) => {
    setSelectedItems((prev) => ({
      ...prev,
      [category]: item,
    }))
  }

  return (
    <FitLookContext.Provider value={{ userProfile, selectedItems, userImage, handleSelectItem, setCurrentStep }}>
      <div className="fitlook-container">
        <header className="fitlook-header">
          <h1>FitLook</h1>
          <p>AI Outfit Recommender & Visualizer</p>
        </header>

        <main className="fitlook-main">
          {currentStep === "welcome" && (
            <div className="welcome-screen">
              <h2>Welcome to FitLook</h2>
              <p>Discover your perfect outfit with AI-powered recommendations</p>
              <button className="btn btn-primary" onClick={() => setCurrentStep("details")}>
                Get Started
              </button>
              <div className="info-box">
                <h3>About This Preview</h3>
                <p>
                  This is a preview of the FitLook application. To run the full application with backend functionality:
                </p>
                <ol>
                  <li>
                    Install dependencies: <code>npm install</code>
                  </li>
                  <li>
                    Configure MongoDB and Shopify credentials in <code>.env</code>
                  </li>
                  <li>
                    Start backend: <code>npm run dev</code>
                  </li>
                  <li>
                    Start frontend: <code>cd frontend && npm start</code>
                  </li>
                </ol>
                <p>See SETUP_GUIDE.md for complete instructions.</p>
              </div>
            </div>
          )}

          {currentStep === "details" && (
            <div className="user-details-form">
              <h2>Tell Us About Yourself</h2>
              <form onSubmit={handleUserProfileSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="height">Height (cm) *</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="e.g., 170"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight (kg) *</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 70"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="shoeSize">Shoe Size *</label>
                  <input
                    type="text"
                    id="shoeSize"
                    name="shoeSize"
                    value={formData.shoeSize}
                    onChange={handleInputChange}
                    placeholder="e.g., 42"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preferredStyle">Preferred Style *</label>
                  <select
                    id="preferredStyle"
                    name="preferredStyle"
                    value={formData.preferredStyle}
                    onChange={handleInputChange}
                  >
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="party">Party</option>
                    <option value="traditional">Traditional</option>
                    <option value="sporty">Sporty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Upload Your Photo *</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                  {formData.imagePreview && (
                    <div className="image-preview">
                      <img src={formData.imagePreview || "/placeholder.svg"} alt="Preview" />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-large">
                  Continue to Catalog
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep("welcome")}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Back
                </button>
              </form>
            </div>
          )}

          {currentStep === "catalog" && (
            <div className="product-catalog">
              <h2>Select Your Outfit</h2>
              <div className="catalog-info">
                <p>In the full application, this section displays products from your Shopify store.</p>
                <p>
                  <strong>Features:</strong>
                </p>
                <ul>
                  <li>Browse products by category (Tops, Bottoms, Shoes, Accessories)</li>
                  <li>AI-powered recommendations based on your selection</li>
                  <li>Virtual try-on preview</li>
                  <li>Complete outfit discount (10% off)</li>
                  <li>Direct checkout integration</li>
                </ul>
              </div>
              <div className="catalog-actions">
                <button className="btn btn-secondary" onClick={() => setCurrentStep("details")}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep("preview")}>
                  View Preview
                </button>
              </div>
            </div>
          )}

          {currentStep === "preview" && (
            <div className="outfit-preview">
              <h2>Your Outfit Preview</h2>
              <div className="preview-info">
                <p>In the full application, this section shows:</p>
                <ul>
                  <li>Virtual try-on with your uploaded image</li>
                  <li>Selected clothing items overlaid on your photo</li>
                  <li>Recommended complementary items</li>
                  <li>Complete outfit discount banner</li>
                  <li>Add to cart and checkout buttons</li>
                </ul>
              </div>
              {userImage && (
                <div className="preview-container">
                  <img src={userImage || "/placeholder.svg"} alt="Your preview" className="preview-image" />
                </div>
              )}
              <div className="preview-actions">
                <button className="btn btn-secondary" onClick={() => setCurrentStep("catalog")}>
                  Back to Catalog
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="fitlook-footer">
          <p>&copy; 2025 FitLook. All rights reserved.</p>
        </footer>
      </div>
    </FitLookContext.Provider>
  )
}
