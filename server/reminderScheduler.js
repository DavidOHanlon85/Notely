const cron = require("node-cron");
const conn = require("./utils/dbconn");
const sendEmail = require("./utils/email");

cron.schedule("0 * * * *", async () => {
  console.log("Running reminder check...");

  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dateStr = in24Hours.toISOString().split("T")[0];
  const timeStr = in24Hours.toTimeString().split(":").slice(0, 2).join(":"); // e.g. '18:54'

  try {
    console.log("Looking for bookings at:", dateStr, timeStr);

    const selectSQL = `
            SELECT b.*, s.student_first_name, s.student_last_name, s.student_email, t.tutor_first_name, t.tutor_second_name, t.tutor_email
            FROM booking b
            JOIN student s ON b.student_id = s.student_id
            JOIN tutor t ON b.tutor_id = t.tutor_id
            WHERE b.booking_status = 2
                AND b.reminder_sent = 0
                AND b.booking_date = ?
                AND TIME_FORMAT(b.booking_time, '%H:%i') = ?
        `;

    const [rows] = await conn.query(selectSQL, [dateStr, timeStr]);

    for (const booking of rows) {
      // Send reminder email

      console.log(`Reminder due for booking #${booking.booking_id}`);

      const {
        booking_id,
        booking_date,
        booking_time,
        student_first_name,
        student_last_name,
        student_email,
        tutor_first_name,
        tutor_second_name,
        tutor_email,
      } = booking;

      // Format booking_date and booking_time
      const formattedDate = new Date(booking_date).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = booking_time.slice(0, 5); // Ensures HH:mm format

      // Student email
      await sendEmail({
        to: student_email,
        subject: "🎵 Reminder — Your Notely Lesson is Tomorrow",
        html: `
          <p>Hi ${student_first_name},</p>
          <p>This is a friendly reminder that your lesson with <strong>${tutor_first_name} ${tutor_second_name}</strong> is scheduled for <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>
          <p>See you soon!<br/>The Notely Team</p>
        `,
      });

      // Email to tutor
      await sendEmail({
        to: tutor_email,
        subject: "Reminder: Upcoming Notely lesson tomorrow",
        html: `
          <p>Hi ${tutor_first_name},</p>
          <p>This is a reminder that you have a lesson booked with a student <strong>${student_first_name} ${student_last_name}</strong> on <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>
          <p>You can view your full schedule in your dashboard.</p>
        `,
      });

      // Mark as sent

      const updateSQL = `
            UPDATE booking SET reminder_sent = 1 WHERE booking_id = ?
            `;

      await conn.query(updateSQL, [booking.booking_id]);
    }
  } catch (error) {
    console.error("Error checking for reminders:", error);
  }
});
