import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pool from "../db.js";

// 📌 Email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================
// 📌 FORGOT PASSWORD
// =============================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Email not found." });
    }

    const user = rows[0];

    // Generate token valid for 15 minutes
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });


    // FIXED LINK
    const resetLink = `https://clinicsibongaclinic.xyz/reset-password/${token}`;

    // Send email
    await transporter.sendMail({
      from: `Sibonga Dental Clinic <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ message: "✅ Reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "⚠️ Server error sending email." });
  }
};


// =============================
// 📌 RESET PASSWORD
// =============================
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error(err);

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired." });
    }

    res.status(500).json({ message: "Server error." });
  }
};
