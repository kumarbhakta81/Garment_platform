const express = require("express");
const { signup, login, logout, authMiddleware } = require("../controllers/authController");
const { userValidationRules, handleValidationErrors } = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rateLimiting');

const router = express.Router();

router.post("/signup", authLimiter, userValidationRules(), handleValidationErrors, signup);
router.post("/login", authLimiter, login);
router.post("/logout", authMiddleware, logout);

module.exports = router;
