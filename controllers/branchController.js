import pool from "../db.js";

// 🏥 Register Branch
export const registerBranch = async (req, res) => {
  try {
    const { name, address, location, schedule } = req.body;

    if (!name || !address || !location || !schedule) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO branches (name, address, location, schedule)
       VALUES (?, ?, ?, ?)`,
      [name, address, location, schedule]
    );

    res.status(201).json({ message: "Branch added successfully!", id: result.insertId });
  } catch (error) {
    console.error("Error inserting branch:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// 📋 Get all branches
export const getBranches = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM branches");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ message: "Server error" });
  }
};
