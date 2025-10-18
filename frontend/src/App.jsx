// App.jsx
"use client"

// Main App component - routing and state management
import React, { useState, createContext } from "react"
import UserDetailsForm from "./components/UserDetailsForm"
import ProductCatalog from "./components/ProductCatalog"
import OutfitPreview from "./components/OutfitPreview"
import AdminPanel from "./components/AdminPanel"
import "./styles/App.css"

// --- 1. Define and Export Context ---
// Create context for managing app state
export const FitLookContext = createContext({
  userProfile: null,
  userImage: null,
  selectedItems: { top: null, bottom: null, shoes: null, accessories: [] },
  setCurrentStep: () => {},
  handleSelectItem: () => {},
});

function App() {
  // --- 2. State Management ---
  const [currentStep, setCurrentStep] = useState("welcome") // welcome, details, catalog, preview, admin
  const [userProfile, setUserProfile] = useState(null)
  const [selectedItems, setSelectedItems] = useState({
    top: null,
    bottom: null,
    shoes: null,
    accessories: [],
  })
  const [userImage, setUserImage] = useState(null)

  // --- 3. Handlers ---

  // Handle user profile submission
  const handleUserProfileSubmit = (profile) => {
    setUserProfile(profile)
    // NOTE: profile.image contains the Data URL or model path
    setUserImage(profile.image) 
    setCurrentStep("catalog")
  }

  // Handle all main item selection (Tops, Bottoms, Shoes) AND Accessory toggling
  const handleSelectItem = (item, category) => {
    setSelectedItems((prev) => {
      if (category === "accessories") {
        // Toggling accessory: Check if item is already in the array
        const isSelected = prev.accessories.some(a => a.id === item.id)
        
        return {
          ...prev,
          accessories: isSelected
            ? prev.accessories.filter(a => a.id !== item.id) // Remove it
            : [...prev.accessories, item], // Add it
        }
      } else {
        // Toggling main items (top, bottom, shoes): If already selected, deselect (set to null)
        const isSelected = prev[category] && prev[category].id === item.id;
        
        return {
          ...prev,
          [category]: isSelected ? null : item,
        }
      }
    })
  }
  
  // NOTE: Removed the separate handleSelectAccessory to consolidate logic in handleSelectItem.
  // The Recommendations component should call handleSelectItem(item, 'accessories')

  // --- 4. Context Value ---
  const contextValue = {
    userProfile,
    selectedItems,
    userImage,
    setCurrentStep, // Provide the setter for routing
    handleSelectItem, // Consolidated item selector
  }

  // --- 5. Component Rendering (Routing) ---
  return (
    <FitLookContext.Provider value={contextValue}>
      <div className="app-container">
        <header className="app-header">
          <h1>FitLook</h1>
          <p>AI Outfit Recommender & Visualizer</p>
          {/* Add a dynamic Home/Back button for convenience */}
          {currentStep !== 'welcome' && (
            <button className="btn btn-home" onClick={() => setCurrentStep("welcome")}>
                Home
            </button>
          )}
        </header>

        <main className="app-main">
          {currentStep === "welcome" && (
            <div className="welcome-screen">
              <h2>Welcome to FitLook</h2>
              <p>Discover your perfect outfit with AI-powered recommendations.</p>
              <button className="btn btn-primary" onClick={() => setCurrentStep("details")}>
                Get Started
              </button>
              <button className="btn btn-secondary" onClick={() => setCurrentStep("admin")}>
                Admin Panel
              </button>
            </div>
          )}

          {currentStep === "details" && <UserDetailsForm onSubmit={handleUserProfileSubmit} />}

          {currentStep === "catalog" && <ProductCatalog />}

          {currentStep === "preview" && <OutfitPreview />}

          {currentStep === "admin" && <AdminPanel />}
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 FitLook. All rights reserved.</p>
        </footer>
      </div>
    </FitLookContext.Provider>
  )
}

export default App