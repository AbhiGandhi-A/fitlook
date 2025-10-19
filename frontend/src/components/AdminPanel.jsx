"use client"

import { useState } from "react"
import { apiCall } from "../services/apiClient"
import "../styles/AdminPanel.css"

function AdminPanel() {
  const [adminPassword, setAdminPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [discountRules, setDiscountRules] = useState([])
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    discountPercentage: 10,
    requiredItems: { top: true, bottom: true },
  })
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async (e) => {
    e.preventDefault()

    if (adminPassword !== "admin123") {
      alert("Invalid password")
      return
    }

    setLoading(true)
    try {
      const data = await apiCall("/admin/discount-rules", "GET", null, { adminPassword })
      setIsAuthenticated(true)
      setDiscountRules(Array.isArray(data) ? data : [])
      console.log("[FitLook] Admin authenticated successfully")
    } catch (error) {
      console.error("[FitLook] Error fetching discount rules:", error)
      alert("Login failed: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRule = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await apiCall("/admin/discount-rules", "POST", newRule, { adminPassword })

      if (result.success || result.rule) {
        const rule = result.rule || result
        setDiscountRules([...discountRules, rule])
        setNewRule({
          name: "",
          description: "",
          discountPercentage: 10,
          requiredItems: { top: true, bottom: true },
        })
        alert("Discount rule created successfully")
      }
    } catch (error) {
      console.error("[FitLook] Error creating rule:", error)
      alert("Failed to create discount rule: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h2>Admin Panel</h2>
        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              type="password"
              id="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password (admin123)"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      {/* Create New Discount Rule */}
      <section className="admin-section">
        <h3>Create Discount Rule</h3>
        <form onSubmit={handleCreateRule}>
          <div className="form-group">
            <label htmlFor="ruleName">Rule Name</label>
            <input
              type="text"
              id="ruleName"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              placeholder="e.g., Complete Outfit Discount"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              placeholder="Describe the discount rule"
            />
          </div>

          <div className="form-group">
            <label htmlFor="discount">Discount Percentage</label>
            <input
              type="number"
              id="discount"
              value={newRule.discountPercentage}
              onChange={(e) => setNewRule({ ...newRule, discountPercentage: Number.parseInt(e.target.value) })}
              min="0"
              max="100"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Rule"}
          </button>
        </form>
      </section>

      {/* Existing Discount Rules */}
      <section className="admin-section">
        <h3>Existing Discount Rules</h3>
        {discountRules.length > 0 ? (
          <div className="rules-list">
            {discountRules.map((rule) => (
              <div key={rule._id} className="rule-card">
                <h4>{rule.name}</h4>
                <p>{rule.description}</p>
                <p className="discount-badge">{rule.discountPercentage}% OFF</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No discount rules created yet</p>
        )}
      </section>
    </div>
  )
}

export default AdminPanel
