//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");
const stripe = require("./../lib/stripe");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const path = require("path");
const fs = require("fs");

// GET requests

// Get user route - used only for testing
exports.users = async (req, res) => {
  try {
    const selectSQL =
      "SELECT user_id, user_username, user_email_address FROM user";
    const [rows] = await conn.query(selectSQL);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
};

  // Gets availability date for tutors - parses it into times and displays this to the user
  // Logic integrated to deal with updated booking and manual session override by the tutor
exports.getAvailability = async (req, res) => {
    try {
      const { tutor_id, date } = req.query;
  
      if (!tutor_id || !date) {
        return res.status(400).json({ error: "Missing tutor_id or date" });
      }
  
      // Step 1: Get day of week from date
      const dayIndex = new Date(date).getUTCDay();
      const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayOfWeek = dayMap[dayIndex];
  
      // Step 2: Fetch weekly availability slot labels
      const selectAvailabilitySQL = `
        SELECT time_slot
        FROM availability
        WHERE tutor_id = ? AND day_of_week = ? AND is_available = 1
      `;
      const [defaultAvailability] = await conn.query(selectAvailabilitySQL, [
        tutor_id,
        dayOfWeek,
      ]);
      const slotLabels = defaultAvailability.map((row) => row.time_slot);
  
      // Step 3: Map slot labels to actual times
      const slotMap = {
        Morning: ["07:00:00", "08:00:00", "09:00:00", "10:00:00", "11:00:00"],
        Afternoon: ["12:00:00", "13:00:00", "14:00:00"],
        "After School": ["15:00:00", "16:00:00", "17:00:00"],
        Evening: ["18:00:00", "19:00:00", "20:00:00", "21:00:00", "22:00:00"],
      };
  
      let mappedSlots = [];
      slotLabels.forEach((slot) => {
        if (slotMap[slot]) {
          mappedSlots = mappedSlots.concat(slotMap[slot]);
        }
      });
  
      // Step 4: Fetch overrides for that date
      const selectOverridesSQL = `
        SELECT override_time_slot
        FROM tutor_availability_override
        WHERE tutor_id = ? AND override_date = ? AND override_is_available = 0
      `;
      const [overrides] = await conn.query(selectOverridesSQL, [tutor_id, date]);
      const overriddenTimes = overrides.map((row) =>
        new Date(`1970-01-01T${row.override_time_slot}`)
          .toTimeString()
          .slice(0, 8)
      );
  
      // Step 5: Fetch booked slots for that date
      const selectBookedSQL = `
        SELECT booking_time
        FROM booking
        WHERE tutor_id = ? AND booking_date = ? AND booking_status IN (1, 2)
      `;
      const [bookings] = await conn.query(selectBookedSQL, [tutor_id, date]);
      const bookedTimes = bookings.map((row) =>
        new Date(`1970-01-01T${row.booking_time}`).toTimeString().slice(0, 8)
      );
  
      // Step 6: Remove overridden and booked times
      const finalSlots = mappedSlots.filter(
        (time) => !overriddenTimes.includes(time) && !bookedTimes.includes(time)
      );
  
      res.json({ available_slots: finalSlots });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Gets the available dates over the next 50 days to show calendar highlight to improve UI
exports.getAvailableDates = async (req, res) => {
    try {
      const { tutor_id } = req.query;
      if (!tutor_id) {
        return res.status(400).json({ error: "Missing tutor_id" });
      }
  
      // Step 1: Get default weekly availability
      const selectWeeklyAvailabilitySQL = `
        SELECT day_of_week, time_slot
        FROM availability
        WHERE tutor_id = ? AND is_available = 1
      `;
      const [weeklyAvailability] = await conn.query(selectWeeklyAvailabilitySQL, [
        tutor_id,
      ]);
  
      if (weeklyAvailability.length === 0) {
        return res.json({ available_dates: [] });
      }
  
      const availabilityMap = {};
      weeklyAvailability.forEach((row) => {
        if (!availabilityMap[row.day_of_week]) {
          availabilityMap[row.day_of_week] = [];
        }
        availabilityMap[row.day_of_week].push(row.time_slot);
      });
  
      const slotMap = {
        Morning: ["07:00:00", "08:00:00", "09:00:00", "10:00:00", "11:00:00"],
        Afternoon: ["12:00:00", "13:00:00", "14:00:00"],
        "After School": ["15:00:00", "16:00:00", "17:00:00"],
        Evening: ["18:00:00", "19:00:00", "20:00:00", "21:00:00", "22:00:00"],
      };
  
      const today = new Date();
      const availableDates = [];
  
      for (let i = 0; i < 50; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() + i);
  
        const yyyyMmDd = checkDate.toISOString().split("T")[0];
        const day = checkDate.toLocaleDateString("en-GB", { weekday: "short" });
  
        if (!availabilityMap[day]) continue;
  
        // Step 2: Get overrides
        const selectOverridesSQL = `
          SELECT override_time_slot
          FROM tutor_availability_override
          WHERE tutor_id = ? AND override_date = ? AND override_is_available = 0
        `;
        const [overrides] = await conn.query(selectOverridesSQL, [
          tutor_id,
          yyyyMmDd,
        ]);
        const overriddenTimes = overrides.map((row) =>
          new Date(`1970-01-01T${row.override_time_slot}`)
            .toTimeString()
            .slice(0, 8)
        );
  
        // Step 3: Get hourly slots
        let hourlySlots = [];
        for (const label of availabilityMap[day]) {
          if (slotMap[label]) {
            hourlySlots = hourlySlots.concat(slotMap[label]);
          }
        }
  
        const unblockedSlots = hourlySlots.filter(
          (time) => !overriddenTimes.includes(time)
        );
  
        if (unblockedSlots.length === 0) continue;
  
        // Step 4: Get booked slots
        const selectBookingsSQL = `
          SELECT booking_time
          FROM booking
          WHERE tutor_id = ? AND booking_date = ? AND booking_status != 3
        `;
        const [bookings] = await conn.query(selectBookingsSQL, [
          tutor_id,
          yyyyMmDd,
        ]);
  
        const bookedTimes = bookings.map((b) =>
          new Date(`1970-01-01T${b.booking_time}`).toTimeString().slice(0, 8)
        );
  
        // Step 5: Filter out booked
        const finalSlots = unblockedSlots.filter(
          (slot) => !bookedTimes.includes(slot)
        );
  
        if (finalSlots.length > 0) {
          availableDates.push(yyyyMmDd);
        }
      }
  
      res.json({ available_dates: availableDates });
    } catch (error) {
      console.error("Error getting available dates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// Get all instruments for tutor registration dataset
exports.getAllInstruments = async (req, res) => {
  try {
    const [instruments] = await conn.query(
      `SELECT DISTINCT instrument_name AS instrument, instrument_active 
       FROM instrument
       ORDER BY instrument_name ASC`
    );

    res.json({ instruments });
  } catch (err) {
    console.error("Error fetching distinct instruments:", err);
    res.status(500).json({ error: "Server error fetching instruments" });
  }
};

// Get booking by id
exports.getBookingById = async (req, res) => {
  const { booking_id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role; // 'student' or 'tutor'

  try {
    const [results] = await conn.query(
      `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.booking_time,
        s.student_first_name AS student_name,
        t.tutor_first_name AS tutor_name,
        b.student_id,
        b.tutor_id
      FROM booking b
      JOIN student s ON b.student_id = s.student_id
      JOIN tutor t ON b.tutor_id = t.tutor_id
      WHERE b.booking_id = ?
      `,
      [booking_id]
    );

    const booking = results[0];

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Authorisation: allow only student or tutor on this booking
    if (
      (userRole === 'student' && booking.student_id !== userId) ||
      (userRole === 'tutor' && booking.tutor_id !== userId)
    ) {
      return res.status(403).json({ error: "Unauthorized access to this booking" });
    }

    // Dynamically inject booking_link
    booking.booking_link = `https://meet.jit.si/notely-class-${booking_id}`;

    // trip internal IDs if you want
    delete booking.student_id;
    delete booking.tutor_id;

    return res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST requests

// Creates a booking for a student
exports.createBooking = async (req, res) => {
  try {
    const { tutor_id, student_id, booking_date, booking_time, booking_notes } =
      req.body;

    console.log(req.body);

    // Notes validation and cleanup
    let cleanedNotes = "";

    // If booking_notes exists, validate type and length
    if (booking_notes !== undefined) {
      if (typeof booking_notes !== "string") {
        return res
          .status(400)
          .json({ error: "booking_notes must be a string" });
      }

      if (booking_notes.length > 200) {
        return res
          .status(400)
          .json({ error: "booking_notes must be 200 characters or fewer" });
      }

      cleanedNotes = booking_notes.trim();
    }

    if (!tutor_id || !student_id || !booking_date || !booking_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Preventing double booking
    const checkSQL = `
    SELECT * FROM booking
    WHERE tutor_id = ? AND booking_date = ? AND booking_time = ? AND booking_status IN (1, 2)
    `;
    const [existing] = await conn.query(checkSQL, [
      tutor_id,
      booking_date,
      booking_time,
    ]);

    console.log(existing);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Time slot already booked" });
    }

    // Insert new booking
    const insertSQL = `
    INSERT INTO booking (tutor_id, student_id, booking_date, booking_time, booking_notes, booking_status, booking_created_at, booking_updated_at)
    VALUES (?, ?, ?, ?, ?, 2, NOW(), NOW())
    `;

    await conn.query(insertSQL, [
      tutor_id,
      student_id,
      booking_date,
      booking_time,
      cleanedNotes,
    ]);

    res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.log("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Creates a checkout session for a student
exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      tutor_id,
      student_id,
      booking_date,
      booking_time,
      booking_notes,
      return_url,
    } = req.body;

    const cancelUrl =
      return_url || `${process.env.FRONTEND_URL}/booking-cancelled`;

    if (!tutor_id || !student_id || !booking_date || !booking_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate notes (optional)
    let cleanedNotes = "";
    if (booking_notes !== undefined) {
      if (typeof booking_notes !== "string") {
        return res
          .status(400)
          .json({ error: "booking_notes must be a string" });
      }
      if (booking_notes.length > 200) {
        return res
          .status(400)
          .json({ error: "booking_notes must be 200 characters or fewer" });
      }
      cleanedNotes = booking_notes.trim();
    }

    // Check for existing confirmed or pending booking
    const [existing] = await conn.query(
      `SELECT * FROM booking
       WHERE tutor_id = ? AND booking_date = ? AND booking_time = ?
       AND booking_status IN (1, 2)`,
      [tutor_id, booking_date, booking_time]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Time slot already booked" });
    }

    // Insert pending booking (status = 1)
    const [insertResult] = await conn.query(
      `INSERT INTO booking (tutor_id, student_id, booking_date, booking_time, booking_notes, booking_status, booking_created_at, booking_updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [tutor_id, student_id, booking_date, booking_time, cleanedNotes]
    );

    const booking_id = insertResult.insertId;

    console.log("Insert id:", booking_id);

    // Get tutor price
    const [rows] = await conn.query(
      `SELECT tutor_price FROM tutor WHERE tutor_id = ?`,
      [tutor_id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    const tutor_price = rows[0].tutor_price;
    const priceInPence = tutor_price * 100;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "gbp",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Music lesson with tutor #${tutor_id}`,
            },
            unit_amount: priceInPence,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "Notely booking fee" },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: String(booking_id),
      },
      payment_intent_data: {
        metadata: {
          booking_id: String(booking_id),
        },
      },
      success_url: `${process.env.FRONTEND_URL}/booking-success?tutor_id=${tutor_id}&booking_date=${booking_date}&booking_time=${booking_time}`,
      cancel_url: cancelUrl,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
};

// Stripe webhook to complete purchase - logic to deal with race conditions and to send email confirmations of successful bookings
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Full session object:", session);
    const metadata = session.metadata;
    const booking_id = parseInt(metadata.booking_id, 10);

    if (isNaN(booking_id)) {
      console.error("Missing or invalid booking_id in metadata (success)");
      return res.status(400).send("Invalid or missing booking ID");
    }

    try {
      // Update booking to confirmed
      const updateSQL = `
        UPDATE booking
        SET booking_status = 2, booking_updated_at = NOW()
        WHERE booking_id = ?
      `;
      await conn.query(updateSQL, [booking_id]);

      // Confirmation to console
      console.log(`Booking #${booking_id} confirmed via Stripe`);

      // Fetch student and tutor details for email
      const bookingRowsSQL = `
         SELECT b.booking_date, b.booking_time, s.student_first_name, s.student_email, t.tutor_first_name, t.tutor_second_name, t.tutor_email
         FROM booking b
         JOIN student s ON b.student_id = s.student_id
         JOIN tutor t ON b.tutor_id = t.tutor_id
         WHERE b.booking_id = ?
      `;
      const [bookingRows] = await conn.query(bookingRowsSQL, [booking_id]);

      if (!bookingRows.length) {
        console.error("Booking not found for email data");
        return res.status(404).send("Booking not found");
      }

      const booking = bookingRows[0];
      const {
        booking_date,
        booking_time,
        student_first_name,
        student_email,
        tutor_first_name,
        tutor_second_name,
        tutor_email,
      } = booking;

      // Convert and format booking_date and booking_time
      const formattedDate = new Date(booking_date).toLocaleDateString("en-GB", {
        weekday: "long", // e.g. Monday
        year: "numeric",
        month: "long", // e.g. July
        day: "numeric",
      });

      const formattedTime = booking_time.slice(0, 5); // e.g. '08:00' (HH:mm)

      // Email to student
      await sendEmail({
        to: student_email, //student_email,
        subject: "🎵 Booking Confirmed — Your Notely Lesson",
        html: `
          <p>Hi ${student_first_name},</p>
          <p>Your lesson with ${tutor_first_name} ${tutor_second_name} has been confirmed for <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>
          <p>Thanks for using Notely!</p>
        `,
      });

      // Email to tutor
      await sendEmail({
        to: tutor_email, //tutor_email,
        subject: "🎵 New Student Booking via Notely",
        html: `
          <p>Hi ${tutor_first_name},</p>
          <p>A new student has booked a lesson with you for <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>
          <p>You can view your updated schedule in the dashboard.</p>
          <p>Team Notely!</p>
        `,
      });

      return res.status(200).send("Booking confirmed");
    } catch (err) {
      console.error("Error updating booking after Stripe payment:", err);
      return res.status(500).send("Failed to confirm booking");
    }
  }

  // Handle failed or expired payments
  if (
    event.type === "checkout.session.expired" ||
    (event.type === "payment_intent.payment_failed" &&
      event.data.object.metadata?.booking_id)
  ) {
    const booking_id = parseInt(event.data.object.metadata.booking_id, 10);

    if (isNaN(booking_id)) {
      console.error("Missing or invalid booking_id in metadata (failure)");
      return res.status(400).send("Invalid or missing booking ID");
    }

    try {
      await conn.query(
        `UPDATE booking SET booking_status = 3, booking_updated_at = NOW() WHERE booking_id = ?`,
        [booking_id]
      );
      console.log(
        `Booking #${booking_id} marked as cancelled (payment failed)`
      );
      return res.status(200).send("Booking cancelled");
    } catch (err) {
      console.error("Error marking booking as cancelled:", err);
      return res.status(500).send("Failed to cancel booking");
    }
  }

  // Default response for unhandled event types
  console.log(`Unhandled Stripe event type: ${event.type}`);
  res.status(200).json({ received: true });
};

// Gets initial Student Dashboard data (TEST ONLY ROUTE)
exports.getStudentDashboard = async (req, res) => {
  try {
    const { student_id, student_first_name } = req.user;

    // May need addtional DB call depending on required data

    return res.status(200).json({
      student_id,
      student_first_name,
      message: "Welcome to your dashboard!",
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Gets initial Tutor Dashboard data (TEST ONLY ROUTE)
exports.getTutorDashboard = async (req, res) => {
  try {
    const { tutor_id, tutor_first_name } = req.user;

    // May need addtional DB call depending on required data

    return res.status(200).json({
      tutor_id,
      tutor_first_name,
      message: "Welcome to your dashboard!",
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Gets initial Admin Dashboard data (TEST ONLY ROUTE)
exports.getAdminDashboard = (req, res) => {
  const { admin_id, admin_first_name } = req.user;
  return res.status(200).json({
    admin_id,
    admin_first_name,
    message: "Welcome to your admin dashboard!",
  });
};

// Post Image to local storage
exports.handleTutorImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "Image uploaded successfully",
    filePath: `/uploads/tutor_images/${req.file.filename}`,
  });
};

// Verfication Documents Routes

// Get uploaded documents for tutor's My Profile Page
exports.getTutorVerificationDocs = async (req, res) => {
  try {
    const tutorId = req.user.tutor_id;
    const base = path.join(__dirname, "..", "uploads", "verification", `tutor_${tutorId}`);

    if (!fs.existsSync(base)) return res.json({ files: [] });

    const files = fs.readdirSync(base).map((name) => ({
      name,
      url: `/uploads/verification/tutor_${tutorId}/${encodeURIComponent(name)}`,
    }));

    res.json({ files });
  } catch (err) {
    console.error("getTutorVerificationDocs error:", err);
    res.status(500).json({ message: "Failed to read files" });
  }
};

// Post new documents to the Tutors Upload Folder
exports.uploadTutorVerificationDocs = async (req, res) => {
  try {
    // Multer has already saved files to disk at this point
    const payload = [];
    ["dbs", "qualified", "sen"].forEach((k) => {
      (req.files?.[k] || []).forEach((f) => {
        payload.push({
          field: k,
          filename: f.filename,
          mimetype: f.mimetype,
          size: f.size,
        });
      });
    });

    res.json({ success: true, files: payload });
  } catch (err) {
    console.error("uploadTutorVerificationDocs error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// Let's the tutor delete uploaded documents
exports.deleteTutorVerificationDoc = async (req, res) => {
  try {
    const tutorId = req.user.tutor_id;
    const filename = req.params.filename;
    const full = path.join(__dirname, "..", "uploads", "verification", `tutor_${tutorId}`, filename);

    if (fs.existsSync(full)) fs.unlinkSync(full);
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteTutorVerificationDoc error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};