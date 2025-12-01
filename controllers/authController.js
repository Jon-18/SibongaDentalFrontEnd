import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

// SIGNUP
export const signup = async (req, res) => {
  const { fullName, email, password, phoneNumber, role } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (fullName, email, password, role, phoneNumber)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, hashedPassword, role || "patient", phoneNumber]
    );

    res.status(201).json({
      message: "Signup successful!",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // ok for localhost
      sameSite: "lax", // needed for localhost CORS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete user.password;

    res.json({
      message: "Login successful",
      token: accessToken,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// REFRESH TOKEN
export const refreshToken = (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  });
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ message: "Logged out successfully" });
};
