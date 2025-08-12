//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");
const stripe = require("./../lib/stripe");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const path = require("path");
const fs = require("fs");

// Logs in admin with email or username - sets JWT token live - server side validation of inputs
  exports.loginAdmin = async (req, res) => {
    const { identifier, password, rememberMe } = req.body;
  
    // Server-side validation
    const errors = [];
  
    if (
      !identifier ||
      typeof identifier !== "string" ||
      identifier.trim().length === 0
    ) {
      errors.push("Missing identifier");
    } else if (
      identifier.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())
    ) {
      errors.push("Invalid email format");
    } else if (identifier.length > 50) {
      errors.push("Identifier too long");
    }
  
    if (!password || typeof password !== "string") {
      errors.push("Missing or invalid password");
    }
  
    // Generic error message for client, detailed logs for server
    if (errors.length > 0) {
      console.warn(
        `Login validation failed for IP ${req.ip}. Reason(s): ${errors.join(
          ", "
        )}`
      );
      return res.status(400).json({
        status: "failure",
        message: "Invalid username or password.",
      });
    }
  
    try {
      const selectSQL = `
        SELECT admin_id, admin_first_name, admin_email, admin_username, admin_password, admin_first_name
        FROM admin
        WHERE admin_email = ? OR admin_username = ?
      `;
      const [[admin]] = await conn.query(selectSQL, [identifier, identifier]);
  
      if (!admin) {
        return res.status(404).json({
          status: "failure",
          message: "No admin found with that email or username.",
        });
      }
  
      const isMatch = await bcrypt.compare(password, admin.admin_password);
  
      if (!isMatch) {
        return res.status(401).json({
          status: "failure",
          message: "Incorrect password.",
        });
      }
  
      const token = jwt.sign(
        {
          admin_id: admin.admin_id,
          admin_first_name: admin.admin_first_name,
          admin_email: admin.admin_email,
          userType: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: rememberMe ? "30d" : "1d",
        }
      );
  
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      });
  
      return res.status(200).json({
        status: "success",
        message: `Welcome back, ${admin.admin_first_name}!`,
        admin_id: admin.admin_id,
      });
    } catch (err) {
      console.error("Admin login error:", err);
      return res.status(500).json({
        status: "failure",
        message: "Internal server error.",
      });
    }
  };

  // Admin Logout
  exports.logoutAdmin = (req, res) => {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  
    return res
      .status(200)
      .json({ status: "success", message: "Logged out successfully." });
  };
  
  // Admin reset password email
  exports.forgotPasswordAdmin = async (req, res) => {
    const { email } = req.body;
  
    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: "failure",
        message: "Please provide a valid email address.",
      });
    }
  
    try {
      // Check if admin exists
      const selectSQL = `
        SELECT admin_id, admin_first_name
        FROM admin
        WHERE admin_email = ?
      `;
      const [[admin]] = await conn.query(selectSQL, [email]);
  
      if (!admin) {
        return res.status(404).json({
          status: "failure",
          message: "No admin account found with that email.",
        });
      }
  
      // Generate token and hash it
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
  
      // Store token + expiry in DB
      const updateSQL = `
        UPDATE admin
        SET admin_password_reset_token = ?, admin_password_reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE admin_id = ?
      `;
      await conn.query(updateSQL, [hashedToken, admin.admin_id]);
  
      // Construct reset link
      const resetLink = `http://localhost:5173/admin/reset-password/${resetToken}`;
  
      // Send email
      await sendEmail({
        from: "Notely <notelymusictuition@gmail.com>",
        to: email,
        subject: "Reset your Notely Admin password",
        html: `
          <p>Hi ${admin.admin_first_name},</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin-top:16px;">
            <a href="${resetLink}" style="background:#002147; padding:10px 20px; color:#fff; text-decoration:none; border-radius:6px;">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>Thanks,<br/>The Notely Team</p>
        `,
      });
  
      return res.status(200).json({
        status: "success",
        message: "Password reset link has been sent to your email.",
      });
    } catch (err) {
      console.error("Admin forgot password error:", err);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred.",
      });
    }
  };
  
  // Admin reset password
  exports.resetPasswordAdmin = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
  
    // Basic checks
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    // Password complexity validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
  
    try {
      // Hash token
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
      // Find matching admin
      const [adminRows] = await conn.query(
        `SELECT * FROM admin WHERE admin_password_reset_token = ? AND admin_password_reset_expires > NOW()`,
        [hashedToken]
      );
  
      if (adminRows.length === 0) {
        return res
          .status(400)
          .json({ message: "Token is invalid or has expired." });
      }
  
      const admin = adminRows[0];
  
      // Hash and update password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      await conn.query(
        `UPDATE admin SET admin_password = ?, admin_password_reset_token = NULL, admin_password_reset_expires = NULL WHERE admin_id = ?`,
        [hashedPassword, admin.admin_id]
      );
  
      return res.status(200).json({
        status: "success",
        message: "Password has been reset successfully.",
      });
    } catch (error) {
      console.error("Reset Password Error:", error);
      return res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  };

  // Get logged in admin from JWT
  exports.getLoggedInAdmin = async (req, res) => {
    try {
      const adminId = req.user?.admin_id;
  
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const [rows] = await conn.query(
        `SELECT admin_id, admin_first_name, admin_last_name FROM admin WHERE admin_id = ?`,
        [adminId]
      );
  
      if (!rows.length) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      res.status(200).json(rows[0]); // includes admin_id, first name, last name
    } catch (err) {
      console.error("Error fetching admin:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get information for overview table
  exports.getAdminOverview = async (req, res) => {
    try {
      const range = req.query.range || "last_month";
  
      const getDateRange = () => {
        const now = new Date();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // end of current month
        let startDate;
  
        switch (range) {
          case "last_month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            break;
          case "last_quarter":
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
          case "last_year":
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            break;
          case "all_time":
          default:
            startDate = new Date("2023-01-01");
            break;
        }
  
        return {
          startDateStr: startDate.toISOString().split("T")[0],
          endDateStr: endDate.toISOString().split("T")[0],
        };
      };
  
      const { startDateStr, endDateStr } = getDateRange();
  
      // Total Revenue
      const [[{ totalRevenue }]] = await conn.query(
        `
        SELECT IFNULL(SUM(t.tutor_price), 0) AS totalRevenue
        FROM booking b
        JOIN tutor t ON b.tutor_id = t.tutor_id
        WHERE b.booking_status = 2 AND b.booking_date >= ?
      `,
        [startDateStr]
      );
  
      // Total Bookings
      const [[{ totalBookings }]] = await conn.query(
        `
        SELECT COUNT(*) AS totalBookings
        FROM booking
        WHERE booking_status = 2 AND booking_date >= ?
      `,
        [startDateStr]
      );
  
      // New Users
      const [[{ studentCount }]] = await conn.query(
        `SELECT COUNT(*) AS studentCount
         FROM student
         WHERE student_registration_date >= ?`,
        [startDateStr]
      );
  
      const [[{ tutorCount }]] = await conn.query(
        `SELECT COUNT(*) AS tutorCount
         FROM tutor
         WHERE tutor_registration_date >= ?`,
        [startDateStr]
      );
  
      const totalUsers = studentCount + tutorCount;
  
      // Student Growth Over Time
      const [studentGrowth] = await conn.query(
        `
        SELECT DATE_FORMAT(reg_month, '%b %Y') AS month, total AS count
        FROM (
          SELECT DATE_FORMAT(student_registration_date, '%Y-%m-01') AS reg_month, COUNT(*) AS total
          FROM student
          WHERE student_registration_date >= ?
          GROUP BY reg_month
        ) AS sub
        ORDER BY reg_month
        `,
        [startDateStr]
      );
  
      // Tutor Growth Over Time
      const [tutorGrowth] = await conn.query(
        `
        SELECT DATE_FORMAT(reg_month, '%b %Y') AS month, total AS count
        FROM (
          SELECT DATE_FORMAT(tutor_registration_date, '%Y-%m-01') AS reg_month, COUNT(*) AS total
          FROM tutor
          WHERE tutor_registration_date >= ?
          GROUP BY reg_month
        ) AS sub
        ORDER BY reg_month
        `,
        [startDateStr]
      );
  
      res.json({
        totalRevenue,
        tutorPayouts: totalRevenue * 0.8,
        totalBookings,
        totalUsers,
        newUsers: {
          students: studentCount,
          tutors: tutorCount,
        },
        studentGrowthOverTime: studentGrowth,
        tutorGrowthOverTime: tutorGrowth,
      });
    } catch (err) {
      console.error("Error fetching admin overview:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Get Admin Tutor Table data
  exports.getAllTutorsForAdmin = async (req, res) => {
    try {
      const [rows] = await conn.query(`
        SELECT 
          t.tutor_id,
          t.tutor_first_name,
          t.tutor_second_name,
          t.tutor_email,
          t.tutor_phone,
          t.tutor_city,
          DATE_FORMAT(t.tutor_registration_date, '%d/%m/%Y') AS tutor_registration_date,
          t.tutor_stripe_account_id,
          t.tutor_approval_date,
          (
            SELECT COUNT(*) 
            FROM booking 
            WHERE booking.tutor_id = t.tutor_id 
              AND booking_status = 2
          ) AS booking_count,
          (
            SELECT ROUND(AVG(feedback_score), 1) 
            FROM student_feedback 
            WHERE tutor_id = t.tutor_id
          ) AS average_rating
        FROM tutor t
        ORDER BY t.tutor_registration_date DESC
      `);
  
      // Format for frontend
      const formatted = rows.map((t) => ({
        tutor_id: t.tutor_id,
        name: `${t.tutor_first_name} ${t.tutor_second_name}`,
        tutor_email: t.tutor_email,
        tutor_phone: t.tutor_phone,
        tutor_city: t.tutor_city,
        tutor_registration_date: t.tutor_registration_date,
        tutor_stripe_account_id: t.tutor_stripe_account_id,
        tutor_approval_date: t.tutor_approval_date,
        booking_count: t.booking_count,
        average_rating: t.average_rating,
      }));
  
      res.json(formatted);
    } catch (err) {
      console.error("Error fetching tutor list for admin:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };


// Admin Verify Tutor
  exports.verifyTutor = async (req, res) => {
    const { tutorId } = req.params;
  
    try {
      const [result] = await conn.query(
        `UPDATE tutor SET tutor_approval_date = NOW() WHERE tutor_id = ?`,
        [tutorId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Tutor not found" });
      }
  
      res.json({ message: "Tutor verified." });
    } catch (err) {
      console.error("Error verifying tutor:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Admin Revoke Tutor
  exports.revokeTutor = async (req, res) => {
    const { tutorId } = req.params;
  
    try {
      const [result] = await conn.query(
        `UPDATE tutor SET tutor_approval_date = NULL WHERE tutor_id = ?`,
        [tutorId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Tutor not found" });
      }
  
      res.json({ message: "Tutor verification revoked." });
    } catch (err) {
      console.error("Error revoking tutor:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };


// Admin Send Stripe Reminder
  exports.sendStripeReminder = async (req, res) => {
    const { tutorId } = req.params;
  
    try {
      const [[tutor]] = await conn.query(
        `SELECT tutor_email, tutor_first_name FROM tutor WHERE tutor_id = ?`,
        [tutorId]
      );
  
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }
  
      await sendEmail({
        to: tutor.tutor_email,
        subject: "Reminder: Connect Your Stripe Account",
        html: `
        <p>Hi ${tutor.tutor_first_name},</p>
        <p>This is a quick reminder to connect your Stripe account so you can get paid for your lessons on Notely.</p>
        <p>If you’ve already connected, you can ignore this message. Otherwise, please log in to your tutor dashboard and click “Connect to Stripe.”</p>
        <p>Thanks,<br/>The Notely Team</p>
        `,
      });
  
      res.json({ message: "Reminder email sent." });
    } catch (err) {
      console.error("Error sending Stripe reminder:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get Admin Student Table Data
  exports.getAllStudents = async (req, res) => {
    try {
      const [rows] = await conn.query(`
        SELECT 
          student_id,
          CONCAT(student_first_name, ' ', student_last_name) AS name,
          student_email,
          student_phone,
          student_registration_date,
          student_verification_date
        FROM student
      `);
  
      res.json(rows);
    } catch (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// Admin Verify Student
  exports.verifyStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
      await conn.query(
        `
        UPDATE student
        SET student_verification_date = NOW()
        WHERE student_id = ?
      `,
        [studentId]
      );
  
      res.json({ message: "Student verified." });
    } catch (err) {
      console.error("Error verifying student:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Admin Revoke Student
  exports.revokeStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
      await conn.query(
        `
        UPDATE student
        SET student_verification_date = NULL
        WHERE student_id = ?
      `,
        [studentId]
      );
  
      res.json({ message: "Student verification revoked." });
    } catch (err) {
      console.error("Error revoking student verification:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };