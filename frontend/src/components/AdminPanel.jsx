"use client"

// Admin panel for managing discounts and product categories
import { useState } from "react"
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

  // Handle admin login
  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminPassword === "admin123") {
      setIsAuthenticated(true)
      fetchDiscountRules()
    } else {
      alert("Invalid password")
    }
  }

  // Fetch discount rules
  const fetchDiscountRules = async () => {
    try {
      const response = await fetch("/api/admin/discount-rules", {
        headers: {
          adminPassword: adminPassword,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDiscountRules(data)
      }
    } catch (error) {
      console.error("Error fetching discount rules:", error)
    }
  }

  // Handle new rule creation
  const handleCreateRule = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/discount-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          adminPassword: adminPassword,
        },
        body: JSON.stringify(newRule),
      })

      if (response.ok) {
        const rule = await response.json()
        setDiscountRules([...discountRules, rule.rule])
        setNewRule({
          name: "",
          description: "",
          discountPercentage: 10,
          requiredItems: { top: true, bottom: true },
        })
        alert("Discount rule created successfully")
      }
    } catch (error) {
      console.error("Error creating rule:", error)
      alert("Failed to create discount rule")
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
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Login
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

          <button type="submit" className="btn btn-primary">
            Create Rule
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
