const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "supersecretkey"; // Use .env

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // Check user exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error('Signup error:', err); // <-- Add detailed error logging
    next(err); // pass to error handler
  }
};

// Login & create session
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });
    // Generate session token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1d" });
    // Save session in DB (debug log)
    try {
      const [result] = await pool.query(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))",
        [user.id, token]
      );
      console.log('Session insert result:', result);
    } catch (sessionErr) {
      console.error('Session insert error:', sessionErr);
    }
    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
};

// Middleware to check session
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    // Check token exists in DB and not expired
    const [rows] = await pool.query(
      "SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()",
      [token]
    );
    if (!rows.length) return res.status(401).json({ message: "Session expired or invalid" });
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Logout → delete session
const logout = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "No token" });
  try {
    await pool.query("DELETE FROM sessions WHERE token = ?", [token]);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, username, email FROM users');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted', id });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id]);
    res.json({ message: 'User updated', id, username, email });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getUsers, deleteUser, updateUser, authMiddleware };
