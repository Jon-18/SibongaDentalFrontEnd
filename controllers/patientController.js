import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();

export const registerPatient = async (req, res) => {
  try {
    const { fullName, dateOfBirth, gender, email, cellphone, address } = req.body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !gender || !email || !cellphone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Insert into patients table
    const [patientResult] = await pool.query(
      `INSERT INTO patients (fullName, dateOfBirth, gender, email, cellphone)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, dateOfBirth, gender, email, cellphone]
    );

    // Insert into users table
    const role = "patient";

    const [userResult] = await pool.query(
      `INSERT INTO users (fullName, email, phoneNumber, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, cellphone, address, role]
    );

    res.status(201).json({
      message: "Patient registered successfully!",
      patientId: patientResult.insertId,
      userId: userResult.insertId,
    });

  } catch (error) {
    console.error("Error inserting patient:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


export const getPatients = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM patients");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};
