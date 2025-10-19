"use client"

import { useState, useRef } from "react"
import { saveUserProfile } from "../services/apiClient"
import "../styles/UserDetailsForm.css"

function UserDetailsForm({ onSubmit }) {
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

  // State to track if a model image is being used (not strictly necessary but good for tracking)
  const [useModelImage, setUseModelImage] = useState(false)
  const [loading, setLoading] = useState(false)

  // Ref to access the file input element
  const fileInputRef = useRef(null)

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
      setUseModelImage(false) // User uploaded a custom image, so clear model image flag
    } else {
      // Clear image if the user cancels file selection
      setFormData((prev) => ({
        ...prev,
        image: null,
        imagePreview: null,
      }))
    }
  }

  // Handle model image selection
  const handleModelImageSelect = (modelType) => {
    // Clear the file input's value when a model image is selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    
    // **FIXED: Changed .jpg to .png to match the image source used in the JSX**
    const modelPath = modelType === "male" ? "/male-model.png" : "/female-model.png"

    // Create an image element to load and convert to base64
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)
      
      // Use 'image/png' if the source is .png, or keep 'image/jpeg' if the server converts it, 
      // but sticking to 'image/jpeg' is generally safer for base64 if quality/size isn't critical.
      // Let's keep 'image/jpeg' for consistency in data format unless a specific PNG is required.
      const base64 = canvas.toDataURL("image/jpeg") 

      setFormData((prev) => ({
        ...prev,
        image: base64,
        imagePreview: base64,
        gender: modelType, // Automatically set gender based on model choice
      }))
      setUseModelImage(true)
    }

    img.onerror = () => {
      console.error(`[FitLook] Failed to load model image from path: ${modelPath}. Check file location in 'public' folder.`)
      alert("Error: Could not load model image. Please check that /male-model.png and /female-model.png exist in your public directory.")
    }

    img.src = modelPath 
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.height || !formData.weight || !formData.shoeSize) {
      alert("Please fill in all required fields")
      return
    }

    if (!formData.image) {
      alert("Please upload or select an image")
      return
    }

    setLoading(true)
    try {
      // Ensure height and weight are converted to numbers for API call
      const profileData = {
        name: formData.name,
        height: Number.parseInt(formData.height, 10), 
        weight: Number.parseInt(formData.weight, 10),
        gender: formData.gender,
        shoeSize: formData.shoeSize,
        preferredStyle: formData.preferredStyle,
        uploadedImage: formData.image,
      }

      const result = await saveUserProfile(profileData)

      console.log("[FitLook] Profile saved successfully:", result)

      onSubmit({
        ...formData,
        userId: result.user?._id || result._id,
      })
    } catch (error) {
      console.error("[FitLook] Error saving profile:", error)
      alert("Error saving profile: " + (error.message || "An unknown error occurred."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-details-form">
      <h2>Tell Us About Yourself</h2>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Height */}
        <div className="form-group">
          <label htmlFor="height">Height (cm) *</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
            placeholder="e.g., 170"
            required
          />
        </div>

        {/* Weight */}
        <div className="form-group">
          <label htmlFor="weight">Weight (kg) *</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
            placeholder="e.g., 70"
            required
          />
        </div>

        {/* Gender */}
        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Shoe Size */}
        <div className="form-group">
          <label htmlFor="shoeSize">Shoe Size *</label>
          <input
            type="text"
            id="shoeSize"
            name="shoeSize"
            value={formData.shoeSize}
            onChange={(e) => setFormData((prev) => ({ ...prev, shoeSize: e.target.value }))}
            placeholder="e.g., 42"
            required
          />
        </div>

        {/* Preferred Style */}
        <div className="form-group">
          <label htmlFor="preferredStyle">Preferred Style *</label>
          <select
            id="preferredStyle"
            value={formData.preferredStyle}
            onChange={(e) => setFormData((prev) => ({ ...prev, preferredStyle: e.target.value }))}
          >
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
            <option value="traditional">Traditional</option>
            <option value="sporty">Sporty</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Your Photo *</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload} // Use the defined handler
              ref={fileInputRef} // Attach the ref
              className="file-input"
            />
            {formData.imagePreview && (
              <div className="image-preview">
                <img src={formData.imagePreview || "/placeholder.svg"} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        {/* Model Images */}
        <div className="form-group">
          <label>Or Select a Model Image</label>
          <div className="model-images">
            <div 
              className={`model-option ${formData.imagePreview && useModelImage && formData.gender === 'male' ? 'selected' : ''}`} 
              onClick={() => handleModelImageSelect("male")}
            >
              <img
                src="/male-model.png"
                alt="Male Model"
                onError={(e) => {
                  console.error("[FitLook] Failed to load male model image")
                  e.target.style.display = "none"
                }}
              />
              <p>Male Model</p>
            </div>
            <div 
              className={`model-option ${formData.imagePreview && useModelImage && formData.gender === 'female' ? 'selected' : ''}`} 
              onClick={() => handleModelImageSelect("female")}
            >
              <img
                src="/female-model.png"
                alt="Female Model"
                onError={(e) => {
                  console.error("[FitLook] Failed to load female model image")
                  e.target.style.display = "none"
                }}
              />
              <p>Female Model</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
          {loading ? "Saving..." : "Continue to Catalog"}
        </button>
      </form>
    </div>
  )
}

export default UserDetailsForm