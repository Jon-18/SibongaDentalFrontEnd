import nodemailer from "nodemailer";

export const sendApprovalEmail = async (appt) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "clinicsibongadental@gmail.com",
      pass: "onjugiwlycfcukuc"
    }
  });

  await transporter.sendMail({
    from: "clinicsibongadental@gmail.com",
    to: appt.email,
    subject: "Your Appointment Is Confirmed",
    html: `
      <h2>Appointment Confirmed 🎉</h2>

      <p>Hello <b>${appt.fullName}</b>,</p>
      <p>Your dental appointment has been approved by the doctor.</p>

      <p>
        <b>Date:</b> ${appt.Date}<br>
        <b>Time:</b> `${appt.StartTime} - ${appt.endTime}`<br>
        <b>Dentist:</b> ${appt.doctorName}
      </p>

      <p>Thank you and see you soon! 🦷</p>
    `
  });

  console.log("📨 Email sent to:", appt.email);
};
