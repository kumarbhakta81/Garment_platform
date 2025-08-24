const express = require("express");
const { signup, login, logout, authMiddleware } = require("../controllers/authController");

const router = express.Router();

// Authentication routes
router.post("/register", signup); // POST /api/auth/register - User registration
router.post("/login", login); // POST /api/auth/login - User login with JWT
router.post("/logout", authMiddleware, logout); // POST /api/auth/logout - User logout

// Get current user profile
router.get("/profile", authMiddleware, (req, res) => {
  try {
    // Return current user info from token
    const user = {
      id: req.user.id,
      email: req.user.email
    };
    
    res.json({
      success: true,
      data: { user },
      message: "Profile retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving profile",
      error: error.message
    });
  }
});

// Refresh JWT token
router.post("/refresh-token", authMiddleware, (req, res) => {
  try {
    const jwt = require("jsonwebtoken");
    const SECRET = process.env.JWT_SECRET || "supersecretkey";
    
    // Generate new token with same user data
    const newToken = jwt.sign(
      { id: req.user.id, email: req.user.email }, 
      SECRET, 
      { expiresIn: "1d" }
    );
    
    res.json({
      success: true,
      data: { token: newToken },
      message: "Token refreshed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
      error: error.message
    });
  }
});

module.exports = router;
