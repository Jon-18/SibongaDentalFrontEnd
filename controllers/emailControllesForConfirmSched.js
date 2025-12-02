import Brevo from "@getbrevo/brevo";

export const sendApprovalEmail = async (appt) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.EMAIL_PASS
    );

    const emailData = {
      sender: {
        name: "Clinic Sibonga Dental",
        email: process.env.SENDER_EMAIL
      },
      to: [
        {
          email: appt.email,
          name: appt.fullName
        }
      ],
      subject: "Your Appointment Is Confirmed",
      htmlContent: `
        <h2>Appointment Confirmed 🎉</h2>

        <p>Hello <b>${appt.fullName}</b>,</p>
        <p>Your dental appointment has been approved.</p>

        <p>
          <b>Date:</b> ${appt.Date}<br>
          <b>Time:</b> ${appt.StartTime} - ${appt.endTime}<br>
          <b>Dentist:</b> ${appt.doctorName}
        </p>

        <p>Thank you and see you soon! 🦷</p>
      `
    };

    await apiInstance.sendTransacEmail(emailData);

    console.log("📨 Brevo email sent to:", appt.email);
  } catch (err) {
    console.error("❌ Brevo send error:", err);
  }
};
