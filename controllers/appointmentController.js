import { sendApprovalEmail } from "../controllers/emailControllesForConfirmSched.js";
import pool from "../db.js";

export const createAppointment = async (req, res) => {
  try {
    // Parse incoming data (JSON string from FormData or plain JSON)
    console.log(req.body.data);
    
    const data = req.body.data ? JSON.parse(req.body.data) : req.body;

    const {
      fullName,
      date,
      startTime,
      endTime,
      doctorName,
      paymentMethod,
      contactNumber,
      email,
      services,
    } = data;

    // Validate required fields
    const requiredFields = [
      "fullName",
      "date",
      "startTime",
      "endTime",
      "doctorName",
      "paymentMethod",
      "contactNumber",
      "email",
      "services",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }

    // Handle receipt file
    let receiptUrl = null;
    if (req.file) {
      receiptUrl = `http://localhost:5000/uploadsReceipt/${req.file.filename}`;
    }

    // SQL Insert
    const sql = `
      INSERT INTO appointments
      (fullName, appointmentDate, startTime, endTime, doctorName, paymentMethod, receiptPath, status, createdAt, contactNumber, email, services, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, "Online Booking")
    `;

    const status = "Pending"; // default status

    const params = [
      fullName,
      date,
      startTime,
      endTime,
      doctorName,
      paymentMethod,
      receiptUrl,
      status,
      contactNumber,
      email,
      services,
    ];

    const [result] = await pool.query(sql, params);

    // Optionally send confirmation email
    // await sendApprovalEmail(email, fullName, date, startTime, doctorName);

    res.status(201).json({
      message: "Appointment created!",
      id: result.insertId,
      receiptUrl,
    });
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        *
      FROM appointments
      ORDER BY createdAt DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);

  } catch (err) {
    console.error("❌ Fetch appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { fullName, date, time, doctorName, paymentMethod, receipt, status } =
      req.body;

    const sql = `
      UPDATE appointments
      SET patientName=?, date=?, time=?, doctorName=?, paymentMethod=?, receiptPath=?, status=?
      WHERE id=?
    `;

    const params = [
      fullName,
      date,
      time,
      doctorName,
      paymentMethod,
      receipt,
      status,
      id
    ];

    await pool.query(sql, params);

    res.json({ message: "Appointment updated" });

  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointmentbyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } =
      req.body;

    const sql = `
      UPDATE appointments
      SET status=?
      WHERE id=?
    `;

    const params = [
      status,
      id
    ];

    await pool.query(sql, params);

    res.json({ message: "Appointment updated" });

  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateAppointmentbyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ---------------------------
    // UPDATE status first
    // ---------------------------
    const sqlUpdate = `
      UPDATE appointments
      SET status=?
      WHERE id=?
    `;

    await pool.query(sqlUpdate, [status, id]);

    // ---------------------------
    // FETCH updated appointment (to get email, name, date, doctor, etc.)
    // ---------------------------
    const sqlFetch = `
      SELECT *
      FROM appointments
      WHERE id=?
    `;

    const [rows] = await pool.query(sqlFetch, [id]);

    const appt = rows[0];

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ---------------------------
    // SEND EMAIL ONLY IF APPROVED BY DOCTOR
    // ---------------------------
    if (status === "Approved by Doctor") {
      await sendApprovalEmail(appt);
    }

    res.json({ message: "Appointment updated", appt });

  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


