import pool from "../db.js";

// 💈 Register Service
export const registerService = async (req, res) => {
  try {
    const { serviceName, description, price } = req.body;

    if (!serviceName || !description || !price) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO services (serviceName, description, price)
       VALUES (?, ?, ?)`,
      [serviceName, description, price]
    );

    res.status(201).json({ message: "Service added successfully!", id: result.insertId });
  } catch (error) {
    console.error("Error inserting service:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// 📋 Get all services
export const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM services");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Server error" });
  }
};
