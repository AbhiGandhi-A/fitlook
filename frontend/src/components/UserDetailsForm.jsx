"use client"

import { useState } from "react"
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

  const [useModelImage, setUseModelImage] = useState(false)
  const [loading, setLoading] = useState(false)

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

  // Handle model image selection
  const handleModelImageSelect = (url) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
      imagePreview: url,
    }))
    setUseModelImage(true)
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
      const result = await saveUserProfile({
        name: formData.name,
        height: Number.parseInt(formData.height),
        weight: Number.parseInt(formData.weight),
        gender: formData.gender,
        shoeSize: formData.shoeSize,
        preferredStyle: formData.preferredStyle,
        uploadedImage: formData.image,
      })

      console.log("[FitLook] Profile saved successfully:", result)

      onSubmit({
        ...formData,
        userId: result.user?._id || result._id,
      })
    } catch (error) {
      console.error("[FitLook] Error saving profile:", error)
      alert("Error saving profile: " + error.message)
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            placeholder="e.g., 70"
            required
          />
        </div>

        {/* Gender */}
        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
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
            onChange={handleInputChange}
            placeholder="e.g., 42"
            required
          />
        </div>

        {/* Preferred Style */}
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

        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Your Photo *</label>
          <div className="image-upload-section">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
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
            <div className="model-option" onClick={() => handleModelImageSelect("/male-model.jpg")}>
              <img src="/male-model.jpg" alt="Male Model" />
              <p>Male Model</p>
            </div>
            <div className="model-option" onClick={() => handleModelImageSelect("/female-model.jpg")}>
              <img src="/female-model.jpg" alt="Female Model" />
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
