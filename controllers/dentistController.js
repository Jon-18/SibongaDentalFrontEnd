import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

export const registerDentist = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, licenseNumber, address } = req.body;

    if (!name || !email || !phone || !specialization || !experience || !licenseNumber || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Add dentist to dentists table
    const [dentistResult] = await pool.query(
      `INSERT INTO dentists (name, email, phone, specialization, experience, licenseNumber)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, specialization, experience, licenseNumber]
    );

    // Add dentist to users table with role = "doctor"
    const role = "doctor";

    const [userResult] = await pool.query(
      `INSERT INTO users (fullName, email, phoneNumber, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, address, role]
    );

    return res.status(201).json({
      message: "Dentist registered successfully!",
      dentistId: dentistResult.insertId,
      userId: userResult.insertId
    });

  } catch (error) {
    console.error("Error inserting dentist:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};


export const getDentists = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM dentists");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching dentists:", err);
    res.status(500).json({ message: "Server error" });
  }
};
