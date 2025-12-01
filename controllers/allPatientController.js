import pool from "../db.js";

// 📋 Get all branches
export const getAllPatient = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT fullName FROM users where role = 'patient'");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createAppointmentAdmin = async (req, res) => {
  try {
    // Parse incoming data (JSON string from FormData or plain JSON)
    console.log(req.body.data);
    
    const data = req.body.data ? JSON.parse(req.body.data) : req.body;

    const {
      fullName,
      doctorName,
      date,
      startTime,
      endTime,
      email,
      services,
      notes,
    } = data;

    // Validate required fields
    const requiredFields = [
      "fullName",
      "date",
      "startTime",
      "endTime",
      "doctorName",
      "services",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }


    // SQL Insert
    const sql = `
      INSERT INTO appointments
      (fullName, appointmentDate, startTime, endTime, doctorName, status, createdAt, services, notes)
      VALUES (?, ?, ?, ?, ?, "Approved by Admin", NOW(), ?, "Walk-in")
    `;

    const params = [
      fullName,
      date,
      startTime,
      endTime,
      doctorName,
      email,
      services,
      notes,
    ];

    const [result] = await pool.query(sql, params);

    // Optionally send confirmation email
    // await sendApprovalEmail(email, fullName, date, startTime, doctorName);

    res.status(201).json({
      message: "Appointment created!",
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
};
