const express = require("express");
const { signup, login, logout, authMiddleware } = require("../controllers/authController");
const authMiddlewareJWT = require('../middlewares/authenticateJWT');
const User = require('../models/User');

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

// Get current user profile
router.get("/me", authMiddlewareJWT, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userProfile } = user;
    
    res.json({
      message: 'User profile retrieved successfully',
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
