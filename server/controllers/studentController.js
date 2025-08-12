//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");
const stripe = require("./../lib/stripe");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const path = require("path");
const fs = require("fs");

// Gets student details for Profile Update Form
exports.getStudentById = async (req, res) => {
    const studentId = req.user.student_id; // from decoded JWT
  
    try {
      const [rows] = await conn.query(
        "SELECT student_first_name, student_last_name, student_username, student_email, student_phone FROM student WHERE student_id = ?",
        [studentId]
      );
  
      if (!rows.length) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      return res.json(rows[0]);
    } catch (err) {
      console.error("Error fetching student:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // Gets Booking information for Student Dashboard
exports.getStudentBookings = async (req, res) => {
    const studentId = req.user.student_id;
  
    try {
      const [rows] = await conn.query(
        `SELECT 
          b.booking_id,
          b.booking_date,
          b.booking_time,
          b.booking_status,
          b.booking_link,
          t.tutor_id,
          t.tutor_first_name,
          t.tutor_second_name,
          CASE WHEN sf.booking_id IS NOT NULL THEN 1 ELSE 0 END AS feedback_given
        FROM booking b
        JOIN tutor t ON b.tutor_id = t.tutor_id
        LEFT JOIN student_feedback sf ON b.booking_id = sf.booking_id
        WHERE b.student_id = ? AND b.booking_status = 2
        ORDER BY b.booking_date DESC, b.booking_time DESC`,
        [studentId]
      );
  
      res.json(rows);
    } catch (error) {
      console.error("Error fetching student bookings:", error);
      res.status(500).json({ message: "Server error fetching bookings" });
    }
  };

  // Gets booking information to allow student feedback
exports.getBookingDetails = async (req, res) => {
    const { bookingId } = req.params;
  
    try {
      const [rows] = await conn.query(
        `
        SELECT t.tutor_id, t.tutor_first_name, t.tutor_second_name
        FROM booking b
        JOIN tutor t ON b.tutor_id = t.tutor_id
        WHERE b.booking_id = ?
        `,
        [bookingId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      res.status(200).json({ tutor: rows[0] });
    } catch (error) {
      console.error("Error fetching booking details:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get Students feedback from tutors
exports.getStudentFeedback = async (req, res) => {
    const studentId = req.user.student_id;
    try {
      const [rows] = await conn.query(
        `SELECT 
           f.feedback_date,
           f.performance_score,
           f.homework,
           f.notes,
           t.tutor_id,
           t.tutor_first_name,
           t.tutor_second_name
         FROM tutor_feedback f
         JOIN tutor t ON f.tutor_id = t.tutor_id
         WHERE f.student_id = ?
         ORDER BY f.feedback_date DESC`,
        [studentId]
      );
  
      const result = rows.map((row) => ({
        date: new Date(row.feedback_date).toLocaleDateString("en-GB"),
        performance: row.performance_score,
        homework: row.homework,
        notes: row.notes,
        tutor: `${row.tutor_first_name} ${row.tutor_second_name}`,
        tutor_id: row.tutor_id,
      }));
  
      res.json(result);
    } catch (err) {
      console.error("Error fetching student feedback:", err);
      res.status(500).json({ message: "Server error loading feedback" });
    }
  };

  // Get data for Student Dashboard
exports.getStudentDashboardSummary = async (req, res) => {
    const studentId = req.user.student_id;
  
    try {
      // 1. Total, Upcoming, Completed lessons
      const [lessonStats] = await conn.query(
        `
        SELECT 
          COUNT(*) AS total,
          SUM(booking_date >= CURDATE()) AS upcoming,
          SUM(booking_date < CURDATE()) AS completed
        FROM booking
        WHERE student_id = ? AND booking_status = 2
      `,
        [studentId]
      );
  
      // 2. Tutor Feedback Given
      const [feedbackCount] = await conn.query(
        `
        SELECT COUNT(*) AS feedback_given
        FROM tutor_feedback
        WHERE student_id = ?
      `,
        [studentId]
      );
  
      // 3. Lessons in Last 6 Months
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("default", { month: "short" });
        const key = d.toISOString().slice(0, 7);
        months.push({ key, label, lesson_count: 0 });
      }
  
      const [monthlyLessons] = await conn.query(
        `
        SELECT 
          DATE_FORMAT(booking_date, '%Y-%m') AS month,
          COUNT(*) AS lesson_count
        FROM booking
        WHERE student_id = ? 
          AND booking_status = 2
          AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `,
        [studentId]
      );
  
      const lessonsPerMonth = months.map((m) => {
        const match = monthlyLessons.find((ml) => ml.month === m.key);
        return {
          date: m.label,
          totalLessons: match ? match.lesson_count : 0,
        };
      });
  
      // 4. Star Rating Distribution
      const [starRatings] = await conn.query(
        `
        SELECT 
          performance_score AS score,
          COUNT(*) AS count
        FROM tutor_feedback
        WHERE student_id = ?
        GROUP BY score
        ORDER BY score DESC
      `,
        [studentId]
      );
  
      const feedbackStars = [5, 4, 3, 2, 1].map((s) => {
        const match = starRatings.find((r) => r.score === s);
        return {
          label: `${s} Stars`,
          count: match ? match.count : 0,
        };
      });
  
      // 5. Booking Breakdown Table
      const [bookingBreakdown] = await conn.query(
        `
        SELECT 
          t.tutor_id,
          CONCAT(t.tutor_first_name, ' ', t.tutor_second_name) AS tutor_name,
          COUNT(b.booking_id) AS lesson_count,
          ROUND(AVG(tf.performance_score), 1) AS avg_rating
        FROM booking b
        JOIN tutor t ON b.tutor_id = t.tutor_id
        LEFT JOIN tutor_feedback tf ON tf.booking_id = b.booking_id
        WHERE b.student_id = ? AND b.booking_status = 2
        GROUP BY t.tutor_id
        ORDER BY lesson_count DESC
      `,
        [studentId]
      );
  
      // 6. Upcoming Lessons Table
      const [upcomingLessons] = await conn.query(
        `
        SELECT 
          b.tutor_id,
          CONCAT(t.tutor_first_name, ' ', t.tutor_second_name) AS tutor_name,
          b.booking_date,
          b.booking_time,
          DATE_FORMAT(b.booking_date, '%d/%m/%Y') AS formatted_date,
          TIME_FORMAT(b.booking_time, '%H:%i') AS formatted_time
        FROM booking b
        JOIN tutor t ON b.tutor_id = t.tutor_id
        WHERE b.student_id = ? 
          AND b.booking_status = 2 
          AND b.booking_date >= CURDATE()
        ORDER BY b.booking_date ASC
        LIMIT 5
        `,
        [studentId]
        );
  
      res.json({
        totalLessons: lessonStats[0].total,
        upcomingLessons: upcomingLessons,
        completedLessons: lessonStats[0].completed,
        feedbackGiven: feedbackCount[0].feedback_given,
        lessonsPerMonth,
        feedbackStars,
        bookingBreakdown,
      });
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
      res.status(500).json({ message: "Server error fetching dashboard data" });
    }
  };

  // Get logged in student
exports.getLoggedInStudent = async (req, res) => {
    try {
      const studentId = req.user?.student_id;
      const studentUsername = req.user?.student_username;
  
      if (!studentId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
  
      res.json({
        student_id: studentId,
        student_username: studentUsername,
      });
    } catch (err) {
      console.error("Error fetching student details:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get messages for tutor (with student JWT)
exports.getMessagesForTutor = async (req, res) => {
    const studentId = req.user?.student_id;
    const tutorId = req.params.tutorId;
  
    try {
      const [rows] = await conn.query(
        `SELECT message_id, message_text, sender_role, timestamp
         FROM messages
         WHERE (student_id = ? AND tutor_id = ?)
         ORDER BY timestamp ASC`,
        [studentId, tutorId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ error: "Server error fetching messages" });
    }
  };

  // Sends message to tutor
exports.sendMessage = async (req, res) => {
    try {
      const studentId = req.user?.student_id;
      const { tutor_id, message_text, sender_role } = req.body;
  
      if (!studentId || !tutor_id || !message_text || !sender_role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const [result] = await conn.query(
        `INSERT INTO messages (student_id, tutor_id, message_text, sender_role)
         VALUES (?, ?, ?, ?)`,
        [studentId, tutor_id, message_text, sender_role]
      );
  
      const [inserted] = await conn.query(
        `SELECT message_id, student_id, tutor_id, message_text, sender_role, timestamp 
         FROM messages WHERE message_id = ?`,
        [result.insertId]
      );
  
      res.status(201).json(inserted[0]);
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Allows student to provide feedback for tutor
exports.submitFeedback = async (req, res) => {
    const { feedback_text, feedback_score, feedback_date, tutor_id, booking_id } =
      req.body;
    const token = req.cookies.token;
  
    console.log(req.body);
  
    if (!token) return res.status(401).json({ message: "Not authenticated" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const student_id = decoded.student_id;
  
      // Guard clause: ensure required fields exist
      if (
        !tutor_id ||
        !student_id ||
        !feedback_text ||
        !feedback_score ||
        !feedback_date
      ) {
        return res
          .status(400)
          .json({ message: "Missing required feedback fields" });
      }
  
      // Optional: prevent duplicate feedback on the same booking (if booking_id is provided)
      if (booking_id) {
        const [duplicate] = await conn.query(
          "SELECT * FROM student_feedback WHERE tutor_id = ? AND student_id = ? AND feedback_date = ?",
          [tutor_id, student_id, feedback_date]
        );
  
        if (duplicate.length > 0) {
          return res
            .status(409)
            .json({ message: "Feedback already submitted for this session" });
        }
      }
  
      // Insert feedback into the database
      const sql = `
      INSERT INTO student_feedback (feedback_text, feedback_score, feedback_date, tutor_id, student_id, booking_id) VALUES (?, ?, ?, ?, ?, ?)`;
      await conn.query(sql, [
        feedback_text.trim(),
        feedback_score,
        feedback_date,
        tutor_id,
        student_id,
        booking_id,
      ]);
  
      res.status(201).json({ message: "Feedback submitted successfully." });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({ message: "Server error submitting feedback" });
    }
  };

  // Cancels booking for student
exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const studentId = decoded.student_id;
  
      // Confirm booking belongs to the authenticated student
      const [result] = await conn.query(
        "SELECT student_id FROM booking WHERE booking_id = ?",
        [id]
      );
  
      if (result.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }
  
      console.log(
        "Booking belongs to student:",
        result[0].student_id,
        "| Logged-in student:",
        studentId
      );
      if (result[0].student_id !== studentId) {
        return res
          .status(403)
          .json({ error: "You are not allowed to cancel this booking" });
      }
  
      // Update booking status to 'cancelled' (3) and set updated_at timestamp
      const sql = `
        UPDATE booking 
        SET booking_status = 3, booking_updated_at = NOW() 
        WHERE booking_id = ?
        `;
      await conn.query(sql, [id]);
  
      res.status(200).json({ message: "Booking cancelled successfully." });
    } catch (err) {
      console.error("Error cancelling booking:", err);
      res.status(500).json({ error: "Failed to cancel booking." });
    }
  };

  // Patches My Profile on Student Dashboard
exports.updateStudentProfile = async (req, res) => {
    const studentId = req.user.student_id;
  
    const {
      student_first_name,
      student_last_name,
      student_username,
      student_email,
      student_phone,
    } = req.body;
  
    const errors = {};
  
    // Server-side validation
    if (!student_first_name || student_first_name.trim() === "") {
      errors.student_first_name = "First name is required.";
    }
  
    if (!student_last_name || student_last_name.trim() === "") {
      errors.student_last_name = "Last name is required.";
    }
  
    if (!student_username || student_username.trim() === "") {
      errors.student_username = "Username is required.";
    }
  
    if (!student_email || student_email.trim() === "") {
      errors.student_email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student_email)) {
      errors.student_email = "Enter a valid email.";
    }
  
    if (!student_phone || student_phone.trim() === "") {
      errors.student_phone = "Phone number is required.";
    }
  
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
  
    try {
      // Check if email or username is already taken by another student
      const [duplicates] = await conn.execute(
        `SELECT student_id FROM student 
         WHERE (student_email = ? OR student_username = ?) AND student_id != ?`,
        [student_email, student_username, studentId]
      );
  
      if (duplicates.length > 0) {
        if (duplicates.some((row) => row.student_email === student_email)) {
          errors.student_email = "This email is already in use.";
        }
  
        if (duplicates.some((row) => row.student_username === student_username)) {
          errors.student_username = "This username is already taken.";
        }
  
        return res.status(400).json({ errors });
      }
  
      // Proceed with update
      await conn.execute(
        `UPDATE student SET student_first_name = ?, student_last_name = ?, student_username = ?, 
         student_email = ?, student_phone = ? WHERE student_id = ?`,
        [
          student_first_name,
          student_last_name,
          student_username,
          student_email,
          student_phone,
          studentId,
        ]
      );
  
      return res.json({
        status: "success",
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ message: "Update failed" });
    }
  };

  // Get student conversations
exports.getStudentConversations = async (req, res) => {
    try {
      const student_id = req.user.student_id;
  
      const sql = `
        SELECT
          m.tutor_id,
          t.tutor_first_name,
          t.tutor_second_name,
          t.tutor_image,
          MAX(m.timestamp) AS last_message_time,
          SUBSTRING_INDEX(GROUP_CONCAT(m.message_text ORDER BY m.timestamp DESC), ',', 1) AS last_message_text,
          SUM(CASE WHEN m.sender_role = 'tutor' AND m.message_read = 0 THEN 1 ELSE 0 END) AS unread_count
        FROM messages m
        JOIN tutor t ON m.tutor_id = t.tutor_id
        WHERE m.student_id = ?
        GROUP BY m.tutor_id
        ORDER BY last_message_time DESC
      `;
  
      const [rows] = await conn.query(sql, [student_id]);
  
      res.status(200).json(rows);
    } catch (err) {
      console.error("Error fetching student conversations:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Register a new student - BCrypt in use to hash passwords
exports.registerStudent = async (req, res) => {
    try {
      const {
        student_first_name,
        student_last_name,
        student_username,
        student_email,
        student_phone,
        student_password,
        confirmPassword,
      } = req.body;
  
      const errors = {};
  
      // Server-side validation (match frontend)
      if (!student_first_name || student_first_name.trim().length === 0) {
        errors.student_first_name = "First name is required.";
      } else if (student_first_name.length > 35) {
        errors.student_first_name = "First name must be 35 characters or less.";
      }
  
      if (!student_last_name || student_last_name.trim().length === 0) {
        errors.student_last_name = "Last name is required.";
      } else if (student_last_name.length > 35) {
        errors.student_last_name = "Last name must be 35 characters or less.";
      }
  
      if (!student_username || student_username.trim().length === 0) {
        errors.student_username = "Username is required.";
      } else if (student_username.length > 30) {
        errors.student_username = "Username must be 30 characters or less.";
      }
  
      if (!student_email || student_email.trim().length === 0) {
        errors.student_email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student_email)) {
        errors.student_email = "Invalid email format.";
      }
  
      if (!student_phone || student_phone.trim().length === 0) {
        errors.student_phone = "Phone number is required.";
      } else if (!/^\d{11}$/.test(student_phone)) {
        errors.student_phone = "Phone number must be exactly 11 digits.";
      }
  
      if (!student_password) {
        errors.student_password = "Password is required.";
      } else if (
        student_password.length < 8 ||
        !/[A-Z]/.test(student_password) ||
        !/[a-z]/.test(student_password) ||
        !/[0-9]/.test(student_password) ||
        !/[!@#$%^&*]/.test(student_password)
      ) {
        errors.student_password =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
      }
  
      if (student_password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
      }
  
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "failure", errors });
      }
  
      // Check for existing email and username
      const [[emailExists]] = await conn.query(
        "SELECT student_id FROM student WHERE student_email = ?",
        [student_email]
      );
      if (emailExists) {
        errors.student_email = "Email is already registered.";
      }
  
      const [[usernameExists]] = await conn.query(
        "SELECT student_id FROM student WHERE student_username = ?",
        [student_username]
      );
      if (usernameExists) {
        errors.student_username = "Username already taken.";
      }
  
      if (Object.keys(errors).length > 0) {
        return res.status(409).json({ status: "failure", errors });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(student_password, 12);
  
      // Insert new student
      const [result] = await conn.query(
        `INSERT INTO student (
          student_first_name,
          student_last_name,
          student_username,
          student_email,
          student_password,
          student_phone,
          student_verified_email,
          student_registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, 0, CURDATE())`,
        [
          student_first_name,
          student_last_name,
          student_username,
          student_email,
          hashedPassword,
          student_phone,
        ]
      );
  
      await sendEmail({
        from: '"Notely 🎵" <notelymusictuition@gmail.com>',
        to: student_email,
        subject: "Welcome to Notely!",
        html: `
          <p>Welcome to Notely, ${student_first_name}!</p>
          <p>We're thrilled to have you on board. You can now log in and book lessons with our top-rated tutors.</p>
          <p style="margin-top:16px;"> <a href="https://notely.app/login" style="background:#ffc107; padding:10px 20px; color:#000; text-decoration:none; border-radius:6px;">Login to Your Account</a></p>
          <p>Thanks,<br/>The Notely Team</p>
        `,
      });
  
      return res.status(201).json({
        status: "success",
        message: `Student registered with ID ${result.insertId}`,
      });
    } catch (err) {
      console.error("Registration Error:", err);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred.",
      });
    }
  };

  // Logs in student with email or username - sets JWT token live - server side validation of inputs
exports.loginStudent = async (req, res) => {
    try {
      const { identifier, password, rememberMe } = req.body; //identifier = email or username
  
      console.log("Login attempt body:", req.body);
  
      if (!identifier || !password) {
        return res.status(400).json({
          status: "failure",
          message: "Please eneter your email/ username and password.",
        });
      }
  
      // Server side validation
  
      const errors = {};
  
      if (!identifier || identifier.trim().length === 0) {
        errors.identifier = "Email or username is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) &&
        !/^[a-zA-Z0-9_]+$/.test(identifier)
      ) {
        errors.identifier = "Enter a valid email or username.";
      }
  
      if (!password || password.length === 0 || password.trim() === "") {
        errors.password = "Password is required.";
      }
  
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: "failure", errors });
      }
  
      const selectSQL = `
        SELECT student_id, student_first_name, student_password
        FROM student
        WHERE student_email = ? OR student_username = ?
      `;
  
      const [[student]] = await conn.query(selectSQL, [identifier, identifier]);
  
      if (!student) {
        return res.status(401).json({
          status: "failure",
          message: "Account not found. Please check your credentials",
        });
      }
  
      const isMatch = await bcrypt.compare(password, student.student_password);
  
      if (!isMatch) {
        return res.status(401).json({
          status: "failure",
          message: "Incorrect password.",
        });
      }
  
      // SET token her for 'remember me if active
  
      const token = jwt.sign(
        {
          student_id: student.student_id,
          student_first_name: student.student_first_name,
          userType: "student",
        },
        process.env.JWT_SECRET,
        { expiresIn: rememberMe ? "30d" : "1h" }
      );
  
      // Set secure cookie (can only be read by server)
  
      res.cookie("token", token, {
        httpOnly: true, // can't access with JS
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "Strict",
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // ms
      });
  
      console.log("Login successful:", student.student_first_name);
  
      return res.status(200).json({
        status: "success",
        message: `Welcome back, ${student.student_first_name}.`,
        student_id: student.student_id,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred",
      });
    }
  };

  // Student Logout
exports.logoutStudent = (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  
    return res
      .status(200)
      .json({ status: "success", message: "Logged out successfully." });
  };

  // Student reset password email
exports.forgotPasswordStudent = async (req, res) => {
    const { email } = req.body;
  
    // Email validation
  
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: "failure",
        message: "Please provide a valid email address.",
      });
    }
  
    try {
      const selectSQL = `
        SELECT student_id, student_first_name
        FROM student
        WHERE student_email = ?
        `;
  
      const [[student]] = await conn.query(selectSQL, [email]);
  
      if (!student) {
        return res.status(404).json({
          status: "failure",
          message: "No account found with that email.",
        });
      }
  
      // Generate a secure token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
  
      // Store in DB
      const updateSQL = `
        UPDATE student 
        SET student_password_reset_token = ?, student_password_reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE student_id = ?
      `;
      await conn.query(updateSQL, [hashedToken, student.student_id]);
  
      // Create reset link
      const resetLink = `http://localhost:5173/student/reset-password/${resetToken}`;
  
      // Send email
  
      await sendEmail({
        from: "Notely <notelymusictuition@gmail.com>",
        to: email,
        subject: "Reset your Notely password",
        html: `
          <p>Hi ${student.student_first_name},</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin-top:16px;"> <a href="${resetLink}" style="background:#ffc107; padding:10px 20px; color:#000; text-decoration:none; border-radius:6px;">Reset Button</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>Thanks,<br/>The Notely Team</p>
        `,
      });
  
      return res.status(200).json({
        status: "success",
        message: "Password reset link has been sent to your email.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred.",
      });
    }
  };

  // Student reset password
exports.resetPasswordStudent = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
  
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        status: "failure",
        message: "Token and new password are required",
      });
    }
  
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "failure",
        message: "Passwords do not match.",
      });
    }
  
    try {
      // Hash the token to compare with stored hashed version
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
      // Look up student by token and check expiry
      const selectSQL = `
        SELECT student_id 
        FROM student 
        WHERE student_password_reset_token = ? 
        AND student_password_reset_expires > NOW()
      `;
  
      const [[student]] = await conn.query(selectSQL, [hashedToken]);
  
      if (!student) {
        return res.status(400).json({
          status: "failure",
          message: "Invalid or expired token",
        });
      }
  
      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      console.log("New hash:", hashedPassword);
  
      // Update DB with new password, clear reset token fields
      const updateSQL = `
        UPDATE student 
        SET student_password = ?, 
            student_password_reset_token = NULL, 
            student_password_reset_expires = NULL 
        WHERE student_id = ?
      `;
  
      const [result] = await conn.query(updateSQL, [
        hashedPassword,
        student.student_id,
      ]);
      console.log("Password update result:", result);
      console.log(
        "Password successfully updated for student_id:",
        student.student_id
      );
  
      return res.status(200).json({
        status: "success",
        message: "Your password has been successfully reset.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred.",
      });
    }
  };
  