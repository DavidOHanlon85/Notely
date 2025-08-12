//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");
const stripe = require("./../lib/stripe");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const path = require("path");
const fs = require("fs");

// Get all tutors against search criteria
exports.tutors = async (req, res) => {
    console.log("Incoming search query:", req.query);
  
    try {
      const {
        instrument,
        level,
        tutorName,
        lessonType,
        price,
        city,
        qualified,
        gender,
        sen,
        dbs,
        sortBy,
        page = 1,
        limit = 9,
      } = req.query;
  
      const params = [];
      let selectSQL = `
        SELECT t.*, 
          GROUP_CONCAT(DISTINCT i.instrument_name ORDER BY i.instrument_name SEPARATOR ', ') AS instruments,
          s.avg_rating,
          s.review_count,
          s.years_experience
        FROM tutor t
        LEFT JOIN tutor_instrument ti ON t.tutor_id = ti.tutor_id
        LEFT JOIN instrument i ON ti.instrument_id = i.instrument_id
        LEFT JOIN tutor_level tl ON t.tutor_id = tl.tutor_id
        LEFT JOIN level l ON tl.level_id = l.level_id
        LEFT JOIN (
          SELECT
            f.tutor_id,
            ROUND(AVG(f.feedback_score), 1) AS avg_rating,
            COUNT(f.feedback_id) AS review_count,
            TIMESTAMPDIFF(YEAR, MIN(t.tutor_teaching_start_date), CURDATE()) AS years_experience
            FROM student_feedback f
            JOIN tutor t ON f.tutor_id = t.tutor_id
            GROUP BY f.tutor_id
            ) s ON t.tutor_id = s.tutor_id
        WHERE 1 = 1
      `;
  
      let countSQL = `
        SELECT COUNT(DISTINCT t.tutor_id) as count
        FROM tutor t
        LEFT JOIN tutor_instrument ti ON t.tutor_id = ti.tutor_id
        LEFT JOIN instrument i ON ti.instrument_id = i.instrument_id
        LEFT JOIN tutor_level tl ON t.tutor_id = tl.tutor_id
        LEFT JOIN level l ON tl.level_id = l.level_id
        WHERE 1 = 1
      `;
  
      const addFilter = (condition, ...values) => {
        selectSQL += condition;
        countSQL += condition;
        params.push(...values);
      };
  
      if (instrument) addFilter(" AND i.instrument_name = ?", instrument);
      if (level) addFilter(" AND l.level_label = ?", level);
      if (tutorName) {
        const likeTerm = `%${tutorName}%`;
        addFilter(
          " AND (t.tutor_first_name LIKE ? OR t.tutor_second_name LIKE ?)",
          likeTerm,
          likeTerm
        );
      }
      if (lessonType)
        addFilter(
          " AND (t.tutor_modality = ? OR t.tutor_modality = 'Hybrid')",
          lessonType
        );
      if (price) addFilter(" AND t.tutor_price <= ?", price);
      if (city) addFilter(" AND t.tutor_city = ?", city);
      if (qualified) addFilter(" AND t.tutor_qualified = ?", qualified);
      if (gender) addFilter(" AND t.tutor_gender = ?", gender);
      if (sen) addFilter(" AND t.tutor_sen = ?", sen);
      if (dbs) addFilter(" AND t.tutor_dbs = ?", dbs);
  
      // GROUP BY must come before ORDER BY
      selectSQL += " GROUP BY t.tutor_id";
  
      // Sorting
      switch (sortBy) {
        case "priceLowHigh":
          selectSQL += " ORDER BY t.tutor_price ASC";
          break;
        case "priceHighLow":
          selectSQL += " ORDER BY t.tutor_price DESC";
          break;
        case "ratingHighLow":
          selectSQL += " ORDER BY s.avg_rating DESC";
          break;
        case "experienceHighLow":
          selectSQL += " ORDER BY s.years_experience DESC";
          break;
        case "reviewsHighLow":
          selectSQL += " ORDER BY s.review_count DESC";
          break;
        default:
          selectSQL += " ORDER BY t.tutor_id DESC";
          break;
      }
  
      // Pagination
      selectSQL += " LIMIT ? OFFSET ?";
      const finalParams = [
        ...params,
        parseInt(limit),
        (parseInt(page) - 1) * parseInt(limit),
      ];
  
      const [tutors] = await conn.query(selectSQL, finalParams);
      const [countResult] = await conn.query(countSQL, params);
  
      res.json({
        tutors,
        totalTutors: countResult[0].count,
      });
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// Get data required to complete datasets for instrument and city at search page
exports.distinctFields = async (req, res) => {
    try {
      const [instruments] = await conn.query(
        `SELECT DISTINCT instrument_name AS instrument, instrument_active 
        FROM instrument
        WHERE instrument_active = 1
        ORDER BY instrument_name ASC`
      );
  
      const [cities] = await conn.query(
        "SELECT DISTINCT tutor_city AS city FROM tutor ORDER BY tutor_city ASC"
      );
  
      res.json({ instruments, cities });
    } catch (error) {
      console.error("Error fetching distinct fields:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get data to for an individual tutor using tutor_id
exports.getTutorById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Fetching tutor with ID:", id);
  
      // Pagination, Sorting, and Filtering
      const feedbackLimit = parseInt(req.query.feedbackLimit) || 30;
      const feedbackPage = parseInt(req.query.feedbackPage) || 1;
      const feedbackOffset = (feedbackPage - 1) * feedbackLimit;
  
      const sort = req.query.sort;
      const minRating = req.query.minRating;
      const maxRating = req.query.maxRating;
  
      let feedbackSort = "f.feedback_date DESC";
      if (sort === "highest") feedbackSort = "f.feedback_score DESC";
      if (sort === "lowest") feedbackSort = "f.feedback_score ASC";
      if (sort === "oldest") feedbackSort = "f.feedback_date ASC";
      if (sort === "newest") feedbackSort = "f.feedback_date DESC";
  
      // Dynamic WHERE clause for feedback filter
      let feedbackWhere = "f.tutor_id = ?";
      const feedbackParams = [id];
  
      if (minRating) {
        feedbackWhere += " AND f.feedback_score >= ?";
        feedbackParams.push(Number(minRating));
      }
      if (maxRating) {
        feedbackWhere += " AND f.feedback_score <= ?";
        feedbackParams.push(Number(maxRating));
      }
  
      // Fetch main tutor data and instruments
      const [tutor] = await conn.query(
        `SELECT
          t.*,
          GROUP_CONCAT(DISTINCT i.instrument_name ORDER BY i.instrument_name SEPARATOR ', ') AS instruments
        FROM tutor t
        LEFT JOIN tutor_instrument ti ON t.tutor_id = ti.tutor_id
        LEFT JOIN instrument i ON ti.instrument_id = i.instrument_id
        WHERE t.tutor_id = ?
        GROUP BY t.tutor_id
        `,
        [id]
      );
  
      if (!tutor.length) {
        return res.status(404).json({ error: "Tutor not found" });
      }
  
      // Fetch education
      const [education] = await conn.query(
        `SELECT qualification AS degree, institution, year
         FROM education
         WHERE tutor_id = ?
         ORDER BY year DESC`,
        [id]
      );
  
      // Fetch certifications
      const [certifications] = await conn.query(
        `SELECT certification AS name, year
         FROM certification
         WHERE tutor_id = ?
         ORDER BY year DESC`,
        [id]
      );
  
      // Fetch filtered, paginated feedback
      const [feedback] = await conn.query(
        `SELECT
          f.feedback_text,
          f.feedback_score,
          f.feedback_date,
          s.student_first_name,
          s.student_last_name
        FROM student_feedback f
        JOIN student s ON f.student_id = s.student_id
        WHERE ${feedbackWhere}
        ORDER BY ${feedbackSort}
        LIMIT ? OFFSET ?`,
        [...feedbackParams, feedbackLimit, feedbackOffset]
      );
  
      // Get total count for matching feedback
      const [[feedbackTotal]] = await conn.query(
        `SELECT COUNT(*) AS total
         FROM student_feedback f
         WHERE ${feedbackWhere}`,
        feedbackParams
      );
  
      // Fetch feedback rating summary (for full chart)
      const [ratingSummaryRows] = await conn.query(
        `SELECT 
       f.feedback_score AS stars,
       COUNT(*) AS count
     FROM student_feedback f
     WHERE f.tutor_id = ?
     GROUP BY f.feedback_score
     ORDER BY f.feedback_score DESC`,
        [id]
      );
  
      // Normalize to always include 1–5 stars, even if some are missing
      const rating_summary = [5, 4, 3, 2, 1].map((star) => {
        const match = ratingSummaryRows.find((r) => r.stars === star);
        return { stars: star, count: match ? match.count : 0 };
      });
  
      // Fetch availability
      const [availabilityRows] = await conn.query(
        `SELECT day_of_week, time_slot
         FROM availability
         WHERE tutor_id = ? AND is_available = 1`,
        [id]
      );
  
      // Structure availability
      const slots = ["Morning", "Afternoon", "After School", "Evening"];
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
      const availability = {};
      slots.forEach((slot) => {
        availability[slot] = days.map((day) =>
          availabilityRows.some(
            (row) => row.day_of_week === day && row.time_slot === slot
          )
        );
      });
  
      // Fetch tutor stats
      const [stats] = await conn.query(
        `SELECT
          ROUND(AVG(f.feedback_score), 1) AS avg_rating,
          COUNT(f.feedback_id) AS review_count,
          COUNT(DISTINCT f.student_id) AS unique_students,
          TIMESTAMPDIFF(YEAR, t.tutor_teaching_start_date, CURDATE()) AS years_experience
        FROM tutor t
        LEFT JOIN student_feedback f ON f.tutor_id = t.tutor_id
        WHERE t.tutor_id = ?`,
        [id]
      );
  
      // Respond with combined data
      res.json({
        ...tutor[0],
        education,
        certifications,
        feedback,
        feedbackTotal: feedbackTotal.total,
        availability,
        stats: stats[0],
        rating_summary,
      });
    } catch (error) {
      console.error("Error fetching tutor by ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Register a new tutor - BCrypt in use to hash passwords
  exports.registerTutor = async (req, res) => {
    const db = await conn.getConnection();
    try {
      await db.beginTransaction();
  
      const {
        tutor_username,
        tutor_email,
        tutor_phone,
        tutor_first_name,
        tutor_second_name,
        tutor_image,
        tutor_password,
        tutor_address_line_1,
        tutor_address_line_2,
        tutor_city,
        tutor_postcode,
        tutor_country,
        tutor_modality,
        tutor_price,
        tutor_teaching_start_date,
        tutor_tagline,
        tutor_bio_paragraph_1,
        tutor_bio_paragraph_2,
        tutor_dbs,
        tutor_qualified,
        tutor_gender,
        tutor_sen,
        tutor_instruments = [],
        tutor_level = [],
      } = req.body;
  
      const imageFileName = tutor_image || "/uploads/tutor_images/default.jpg";
  
      // Server-side validation
  
      const validationErrors = [];
  
      // Required string fields
      const requiredFields = [
        ["tutor_username", tutor_username],
        ["tutor_email", tutor_email],
        ["tutor_first_name", tutor_first_name],
        ["tutor_second_name", tutor_second_name],
        ["tutor_password", tutor_password],
        ["tutor_address_line_1", tutor_address_line_1],
        ["tutor_city", tutor_city],
        ["tutor_postcode", tutor_postcode],
        ["tutor_country", tutor_country],
        ["tutor_modality", tutor_modality],
        ["tutor_teaching_start_date", tutor_teaching_start_date],
        ["tutor_tagline", tutor_tagline],
        ["tutor_bio_paragraph_1", tutor_bio_paragraph_1],
      ];
  
      for (const [field, value] of requiredFields) {
        if (!value || value.trim() === "") {
          validationErrors.push(`${field} is required.`);
        }
      }
  
      // Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (tutor_email && !emailRegex.test(tutor_email)) {
        validationErrors.push("Invalid email format.");
      }
  
      // Numeric checks
      if (isNaN(tutor_price) || tutor_price <= 0) {
        validationErrors.push("Tutor price must be a positive number.");
      }
  
      if (!Array.isArray(tutor_instruments) || tutor_instruments.length === 0) {
        validationErrors.push("At least one instrument is required.");
      }
  
      if (!Array.isArray(tutor_level) || tutor_level.length === 0) {
        validationErrors.push("At least one level is required.");
      }
  
      // Categorical checks (must be 0 or 1)
      const binaryFields = [
        ["tutor_dbs", tutor_dbs],
        ["tutor_qualified", tutor_qualified],
        ["tutor_gender", tutor_gender],
        ["tutor_sen", tutor_sen],
      ];
      for (const [field, value] of binaryFields) {
        if (value !== 0 && value !== 1) {
          validationErrors.push(`${field} must be 0 or 1.`);
        }
      }
  
      // Tagline length
      if (tutor_tagline && tutor_tagline.length > 45) {
        validationErrors.push("Tagline must be 45 characters or fewer.");
      }
  
      // Paragraphs length
      if (tutor_bio_paragraph_1?.length > 500) {
        validationErrors.push(
          "First bio paragraph must be 500 characters or fewer."
        );
      }
      if (tutor_bio_paragraph_2?.length > 500) {
        validationErrors.push(
          "Second bio paragraph must be 500 characters or fewer."
        );
      }
  
      if (validationErrors.length > 0) {
        await db.rollback();
        return res.status(400).json({ errors: validationErrors });
      }
  
      // Duplicate check
      const [existing] = await db.execute(
        `SELECT 1 FROM tutor WHERE tutor_email = ? OR tutor_username = ?`,
        [tutor_email, tutor_username]
      );
      if (existing.length > 0) {
        await db.rollback();
        return res
          .status(400)
          .json({ errors: ["Email or username already exists."] });
      }
  
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(tutor_password, saltRounds);
  
      // Insert into tutor table
      const [result] = await db.execute(
        `INSERT INTO tutor (
          tutor_username, tutor_email, tutor_verified_email,
          tutor_phone, tutor_first_name, tutor_second_name, tutor_image,
          tutor_address_line_1, tutor_address_line_2, tutor_city,
          tutor_postcode, tutor_country, tutor_modality, tutor_price,
          tutor_teaching_start_date, tutor_tag_line,
          tutor_bio_paragraph_1, tutor_bio_paragraph_2,
          tutor_registration_date, tutor_password,
          tutor_dbs, tutor_qualified, tutor_gender, tutor_sen
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [
          tutor_username,
          tutor_email,
          0, // verified email = false
          tutor_phone,
          tutor_first_name,
          tutor_second_name,
          imageFileName,
          tutor_address_line_1,
          tutor_address_line_2 || null,
          tutor_city,
          tutor_postcode,
          tutor_country,
          tutor_modality,
          tutor_price,
          tutor_teaching_start_date,
          tutor_tagline,
          tutor_bio_paragraph_1,
          tutor_bio_paragraph_2,
          hashedPassword,
          tutor_dbs,
          tutor_qualified,
          tutor_gender,
          tutor_sen,
        ]
      );
  
      const insertedTutorId = result.insertId;
  
      // Insert tutor instruments + mark as active
      for (const instrumentName of tutor_instruments) {
        // Get the instrument_id for the given name
        const [instrumentRows] = await db.execute(
          "SELECT instrument_id FROM instrument WHERE instrument_name = ?",
          [instrumentName]
        );
  
        if (instrumentRows.length === 0) {
          console.warn(`Instrument not found: ${instrumentName}`);
          continue;
        }
  
        const instrumentId = instrumentRows[0].instrument_id;
  
        // Insert into tutor_instrument with instrument_id
        await db.execute(
          "INSERT INTO tutor_instrument (tutor_id, instrument_id) VALUES (?, ?)",
          [insertedTutorId, instrumentId]
        );
  
        // Mark instrument as active
        await db.execute(
          "UPDATE instrument SET instrument_active = 1 WHERE instrument_id = ?",
          [instrumentId]
        );
      }
  
      // Insert tutor levels
      for (const level of tutor_level) {
        await db.execute(
          "INSERT INTO tutor_level (tutor_id, level_id) VALUES (?, ?)",
          [insertedTutorId, level]
        );
      }
  
      // Insert education entries
      if (req.body.education?.length > 0) {
        for (const edu of req.body.education) {
          const { qualification, institution, year } = edu;
          await db.execute(
            "INSERT INTO education (qualification, institution, year, tutor_id) VALUES (?, ?, ?, ?)",
            [qualification, institution, year, insertedTutorId]
          );
        }
      }
  
      // Insert certifications
      if (req.body.certifications?.length > 0) {
        for (const cert of req.body.certifications) {
          const { certification, year } = cert;
          await db.execute(
            "INSERT INTO certification (certification, year, tutor_id) VALUES (?, ?, ?)",
            [certification, year, insertedTutorId]
          );
        }
      }
  
      // Insert availability slots
      if (req.body.availability?.length > 0) {
        for (const slot of req.body.availability) {
          const { day_of_week, time_slot, is_available } = slot;
          await db.execute(
            "INSERT INTO availability (tutor_id, day_of_week, time_slot, is_available) VALUES (?, ?, ?, ?)",
            [insertedTutorId, day_of_week, time_slot, is_available ? 1 : 0]
          );
        }
      }
  
      await db.commit();
  
      try {
        // Send welcome email
        await sendEmail({
          from: '"Notely 🎵" <notelymusictuition@gmail.com>',
          to: tutor_email,
          subject: "Welcome to Notely – Let’s Get Teaching!",
          html: `
      <p>🎵 Welcome to Notely, ${tutor_first_name}!</p>
      <p>Your tutor account has been successfully created. Parents and students can now discover your profile, explore your teaching style, and book lessons.</p>
      <p style="margin-top:16px;"> 
        <a href="https://notely.app/tutor/login" style="background:#6f42c1; padding:10px 20px; color:#fff; text-decoration:none; border-radius:6px;">
          Login to Your Tutor Dashboard
        </a>
      </p>
      <p>Thanks for joining us on this musical journey.<br/>The Notely Team</p>
    `,
        });
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr.message);
      }
  
      res.status(201).json({ message: "Tutor registered successfully" });
    } catch (err) {
      await db.rollback();
      console.error("Registration error:", err);
      res.status(500).json({ error: "Server error during registration" });
    } finally {
      db.release();
    }
  };
  
  // Logs in tutor with email or username - sets JWT token live - server side validation of inputs
  exports.loginTutor = async (req, res) => {
    const { identifier, password, rememberMe } = req.body;
  
    // Server side validation
  
    const errors = {};
  
    if (!identifier || !identifier.trim()) {
      errors.identifier = "Email or username is required.";
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isUsername = /^[a-zA-Z0-9_]+$/.test(identifier);
      if (!isEmail && !isUsername) {
        errors.identifier = "Enter a valid email or username.";
      }
    }
  
    if (!password || password.length === 0) {
      errors.password = "Password is required.";
    }
  
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ status: "failure", errors });
    }
  
    try {
      // Find tutor by email or username
      const findTutorSQL = `
        SELECT tutor_id, tutor_username, tutor_first_name, tutor_email, tutor_password
        FROM tutor
        WHERE tutor_email = ? OR tutor_username = ?
        LIMIT 1
      `;
  
      const [[tutor]] = await conn.query(findTutorSQL, [identifier, identifier]);
  
      if (!tutor) {
        return res.status(401).json({
          status: "failure",
          message: "Account not found.",
        });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, tutor.tutor_password);
      if (!isMatch) {
        return res.status(401).json({
          status: "failure",
          message: "Incorrect password.",
        });
      }
  
      // Generate JWT
      const token = jwt.sign(
        {
          tutor_id: tutor.tutor_id,
          tutor_first_name: tutor.tutor_first_name,
          userType: "tutor",
        },
        process.env.JWT_SECRET,
        { expiresIn: rememberMe ? "7d" : "1d" }
      );
  
      // Set cookie
      res.cookie("tutor_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      });
  
      return res.status(200).json({
        status: "success",
        message: "Tutor login successful",
        tutor_id: tutor.tutor_id,
      });
    } catch (error) {
      console.error("Tutor login error:", error);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred.",
      });
    }
  };
  
  // Tutor Logout
  exports.logoutTutor = (req, res) => {
    res.clearCookie("tutor_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  
    return res
      .status(200)
      .json({ status: "success", message: "Tutor logged out successfully." });
  };
  
  // Tutor reset password email
  exports.forgotPasswordTutor = async (req, res) => {
    const { email } = req.body;
  
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: "failure",
        message: "Please provide a valid email address.",
      });
    }
  
    if (!email || !email.trim()) {
      return res.status(400).json({
        status: "failure",
        message: "Email is required.",
      });
    }
  
    try {
      // Find tutor by email
      const selectSQL = `
        SELECT tutor_id, tutor_first_name
        FROM tutor
        WHERE tutor_email = ?
      `;
      const [[tutor]] = await conn.query(selectSQL, [email]);
  
      if (!tutor) {
        return res.status(404).json({
          status: "failure",
          message: "No account found with that email.",
        });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
  
      // Save hashed token + expiry
      const updateSQL = `
        UPDATE tutor
        SET tutor_password_reset_token = ?, tutor_password_reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE tutor_id = ?
      `;
      await conn.query(updateSQL, [hashedToken, tutor.tutor_id]);
  
      // Construct reset link (frontend route)
      const resetLink = `http://localhost:5173/tutor/reset-password/${resetToken}`;
  
      // Send email
      await sendEmail({
        from: "Notely <notelymusictuition@gmail.com>",
        to: email,
        subject: "Reset your Notely tutor password",
        html: `
          <p>Hi ${tutor.tutor_first_name},</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin-top:16px;">
            <a href="${resetLink}" style="background:#8551E6; padding:10px 20px; color:#fff; text-decoration:none; border-radius:6px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>Thanks,<br/>The Notely Team</p>
        `,
      });
  
      return res.status(200).json({
        status: "success",
        message: "Password reset link has been sent to your email.",
      });
    } catch (error) {
      console.error("Tutor forgot password error:", error);
      return res.status(500).json({
        status: "failure",
        message: "An internal server error occurred.",
      });
    }
  };
  
  // Tutor reset password
  exports.resetPasswordTutor = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
  
    // Basic password checks
    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: "failure",
        message: "Both password fields are required.",
      });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "failure",
        message: "Passwords do not match.",
      });
    }
  
    // Password strength check
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "failure",
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      });
    }
  
    try {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
      const selectSQL = `
        SELECT tutor_id FROM tutor
        WHERE tutor_password_reset_token = ?
        AND tutor_password_reset_expires > NOW()
        LIMIT 1
      `;
      const [[tutor]] = await conn.query(selectSQL, [hashedToken]);
  
      if (!tutor) {
        return res.status(400).json({
          status: "failure",
          message: "Invalid or expired reset token.",
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const updateSQL = `
        UPDATE tutor
        SET tutor_password = ?, tutor_password_reset_token = NULL, tutor_password_reset_expires = NULL
        WHERE tutor_id = ?
      `;
      await conn.query(updateSQL, [hashedPassword, tutor.tutor_id]);
  
      return res.status(200).json({
        status: "success",
        message: "Password has been successfully reset. You may now log in.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        status: "failure",
        message: "Internal server error.",
      });
    }
  };

  // Get tutor overview details
exports.getTutorOverview = async (req, res) => {
    console.log("Decoded user from token:", req.user);
  
    const tutorId = req.user?.tutor_id;
    const range = req.query.range || "last_month";
  
    if (!tutorId) return res.status(401).json({ error: "Unauthorized" });
  
    try {
      const rangeMap = {
        last_month: "INTERVAL 1 MONTH",
        last_quarter: "INTERVAL 3 MONTH",
        last_year: "INTERVAL 1 YEAR",
        all_time: null,
      };
  
      const interval = rangeMap[range];
  
      // 1. Revenue and lesson filters
      const timeFilter = interval
        ? `AND booking_date >= NOW() - ${interval}`
        : "";
  
      // 1. Total revenue (confirmed = 2)
      const [revenueRow] = await conn.query(
        `SELECT COUNT(b.booking_id) * t.tutor_price AS totalRevenue
         FROM booking b
         JOIN tutor t ON b.tutor_id = t.tutor_id
         WHERE b.tutor_id = ? AND b.booking_status = 2 ${timeFilter}`,
        [tutorId]
      );
  
      // 2. Total lessons
      const [lessonStats] = await conn.query(
        `SELECT
           COUNT(*) AS totalLessons,
           SUM(CASE WHEN booking_status = 2 AND booking_date >= CURDATE() THEN 1 ELSE 0 END) AS upcomingLessons,
           SUM(CASE WHEN booking_status = 2 AND booking_date < CURDATE() THEN 1 ELSE 0 END) AS completedLessons
         FROM booking
         WHERE tutor_id = ? ${timeFilter}`,
        [tutorId]
      );
  
      // 3. Avg. Rating + Star Count
      const [avgRow] = await conn.query(
        `SELECT AVG(feedback_score) AS avgRating
         FROM student_feedback
         WHERE tutor_id = ? ${
           interval ? `AND feedback_date >= CURDATE() - ${interval}` : ""
         }`,
        [tutorId]
      );
  
      const [starCounts] = await conn.query(
        `SELECT feedback_score AS rating, COUNT(*) AS count
         FROM student_feedback
         WHERE tutor_id = ? ${
           interval ? `AND feedback_date >= CURDATE() - ${interval}` : ""
         }
         GROUP BY feedback_score`,
        [tutorId]
      );
  
      // Convert to label format
      const feedbackStars = [5, 4, 3, 2, 1].map((star) => ({
        label: `${star} Stars`,
        count: starCounts.find((r) => r.rating === star)?.count || 0,
      }));
  
      // 4. Revenue over time (monthly)
      const [revenueData] = await conn.query(
        `SELECT
           DATE_FORMAT(b.booking_date, '%Y-%m') AS date,
           SUM(t.tutor_price) AS revenue
         FROM booking b
         JOIN tutor t ON b.tutor_id = t.tutor_id
         WHERE b.tutor_id = ? AND b.booking_status = 2 ${timeFilter}
         GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
         ORDER BY DATE_FORMAT(b.booking_date, '%Y-%m') ASC`,
        [tutorId]
      );
  
      // 5. Get tutor name
  
      const [tutorNameRow] = await conn.query(
        `SELECT tutor_first_name FROM tutor WHERE tutor_id = ?`,
        [tutorId]
      );
  
      return res.json({
        tutorName: tutorNameRow[0]?.tutor_first_name || "Tutor",
        totalRevenue: revenueRow[0].totalRevenue,
        totalLessons: lessonStats[0].totalLessons,
        upcomingLessons: lessonStats[0].upcomingLessons,
        completedLessons: lessonStats[0].completedLessons,
        averageRating: parseFloat(avgRow[0].avgRating) || 0,
        feedbackStars,
        revenueOverTime: revenueData,
      });
    } catch (err) {
      console.error("Tutor overview fetch failed:", err);
      res.status(500).json({ error: "Server error" });
    }
  };

  // Get tutor bookings
exports.getTutorBookings = async (req, res) => {
    try {
      const tutorId = req.user?.tutor_id;
  
      if (!tutorId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: tutor not logged in" });
      }
  
      const [rows] = await conn.query(
        `SELECT 
          b.booking_id,
          b.booking_date,
          b.booking_time,
          b.booking_status,
          b.booking_link,
          s.student_id,
          s.student_first_name,
          s.student_last_name,
          CASE WHEN tf.booking_id IS NOT NULL THEN 1 ELSE 0 END AS feedback_given
        FROM booking b
        JOIN student s ON b.student_id = s.student_id
        LEFT JOIN tutor_feedback tf ON b.booking_id = tf.booking_id
        WHERE b.tutor_id = ? AND b.booking_status = 2
        ORDER BY b.booking_date DESC, b.booking_time DESC`,
        [tutorId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error("Error fetching tutor bookings:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get tutor booking details
exports.getTutorBookingDetails = async (req, res) => {
    const { bookingId } = req.params;
  
    try {
      const [rows] = await conn.query(
        `
        SELECT 
          s.student_id,
          s.student_first_name,
          s.student_last_name,
          t.tutor_id,
          t.tutor_first_name,
          t.tutor_second_name
        FROM booking b
        JOIN student s ON b.student_id = s.student_id
        JOIN tutor t ON b.tutor_id = t.tutor_id
        WHERE b.booking_id = ?
        `,
        [bookingId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      const row = rows[0];
  
      res.status(200).json({
        tutor: {
          tutor_id: row.tutor_id,
          tutor_first_name: row.tutor_first_name,
          tutor_second_name: row.tutor_second_name,
        },
        student: {
          student_id: row.student_id,
          student_first_name: row.student_first_name,
          student_last_name: row.student_last_name,
        },
      });
    } catch (error) {
      console.error("Error fetching tutor feedback booking details:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Tutor cancellation process - including email to student
exports.tutorCancelBooking = async (req, res) => {
    const bookingId = req.params.id;
  
    try {
      // Get booking info including student email
      const [rows] = await conn.query(
        `SELECT b.booking_id, b.booking_date, b.booking_time, s.student_email
         FROM booking b
         JOIN student s ON b.student_id = s.student_id
         WHERE b.booking_id = ? AND b.booking_status = 2`, // confirmed
        [bookingId]
      );
  
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Booking not found or already cancelled." });
      }
  
      const booking = rows[0];
  
      // Update booking status to 3 (cancelled)
      await conn.query(
        `UPDATE booking SET booking_status = 3 WHERE booking_id = ?`,
        [bookingId]
      );
  
      // Send email to student
      await sendEmail({
        to: booking.student_email,
        subject: `Lesson Cancelled`,
        text: `Your upcoming lesson on ${booking.booking_date} at ${booking.booking_time} has been cancelled by the tutor.`,
      });
  
      res.json({ success: true });
    } catch (err) {
      console.error("Error cancelling booking:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Post tutor feedback to student
exports.postTutorFeedback = async (req, res) => {
    const {
      performance_score,
      homework,
      notes,
      tutor_id,
      booking_id,
      feedback_date,
    } = req.body;
  
    if (!performance_score || !tutor_id || !booking_id || !feedback_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    try {
      // Check if feedback already exists
      const [existing] = await conn.query(
        "SELECT * FROM tutor_feedback WHERE booking_id = ?",
        [booking_id]
      );
  
      if (existing.length > 0) {
        return res.status(409).json({ message: "Feedback already submitted." });
      }
  
      // Get student_id from booking
      const [booking] = await conn.query(
        "SELECT student_id FROM booking WHERE booking_id = ?",
        [booking_id]
      );
  
      if (booking.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      const student_id = booking[0].student_id;
  
      // Insert new feedback
      await conn.query(
        `INSERT INTO tutor_feedback 
          (performance_score, homework, notes, tutor_id, student_id, booking_id, feedback_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          performance_score,
          homework || null,
          notes || null,
          tutor_id,
          student_id,
          booking_id,
          feedback_date,
        ]
      );
  
      res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get tutor review details

exports.getTutorReviews = async (req, res) => {
    try {
      const tutorId = req.user?.tutor_id;
  
      if (!tutorId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: tutor not logged in" });
      }
  
      const [rows] = await conn.query(
        `
        SELECT 
          DATE_FORMAT(sf.feedback_date, '%d/%m/%Y') AS date,
          CONCAT(s.student_first_name, ' ', s.student_last_name) AS student,
          sf.feedback_score AS rating,
          sf.feedback_text AS text
        FROM student_feedback sf
        JOIN student s ON sf.student_id = s.student_id
        WHERE sf.tutor_id = ?
        ORDER BY sf.feedback_date DESC
        `,
        [tutorId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch tutor reviews:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get tutor messages table details
exports.getTutorMessages = async (req, res) => {
    try {
      const tutorId = req.user?.tutor_id;
  
      if (!tutorId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: tutor not logged in" });
      }
  
      const [rows] = await conn.query(
        `
        SELECT 
          s.student_id,
          s.student_first_name,
          s.student_last_name,
          m.message_text AS last_message_text,
          m.timestamp AS last_message_time,
          m.message_read
        FROM (
          SELECT 
            student_id,
            MAX(timestamp) AS latest_time
          FROM messages
          WHERE tutor_id = ?
          GROUP BY student_id
        ) AS latest
        JOIN messages m 
          ON m.student_id = latest.student_id AND m.timestamp = latest.latest_time
        JOIN student s 
          ON s.student_id = latest.student_id
        WHERE m.tutor_id = ?
        ORDER BY m.timestamp DESC
        `,
        [tutorId, tutorId]
      );
  
      res.json(rows);
    } catch (err) {
      console.error("Error fetching tutor messages:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Get tutor messages from student (chat functionality)
  exports.getTutorConversation = async (req, res) => {
    const tutorId = req.user?.tutor_id;
    const { student_id } = req.params;
  
    try {
      // Get student info
      const [studentRows] = await conn.query(
        `
        SELECT 
          student_id,
          student_first_name,
          student_last_name,
          student_registration_date
        FROM student
        WHERE student_id = ?
        `,
        [student_id]
      );
  
      if (studentRows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const student = studentRows[0];
  
      // Average rating + review count from tutor_feedback
      const [[feedbackStats]] = await conn.query(
        `
        SELECT 
          ROUND(AVG(performance_score), 1) AS avg_rating,
          COUNT(*) AS review_count
        FROM tutor_feedback
        WHERE student_id = ?
        `,
        [student_id]
      );
  
      // Total Notely lessons across any tutor
      const [[lessonStats]] = await conn.query(
        `
        SELECT COUNT(*) AS total_lessons
        FROM booking
        WHERE student_id = ? AND booking_status = 2
        `,
        [student_id]
      );
  
      // Messages
      const [messages] = await conn.query(
        `
        SELECT message_text, sender_role, timestamp
        FROM messages
        WHERE tutor_id = ? AND student_id = ?
        ORDER BY timestamp ASC
        `,
        [tutorId, student_id]
      );
  
      const memberSince = student.student_registration_date
        ? new Date(student.student_registration_date).toLocaleDateString(
            "en-GB",
            {
              month: "short",
              year: "numeric",
            }
          )
        : "N/A";
  
      res.status(200).json({
        student,
        stats: {
          avg_rating: feedbackStats.avg_rating || "N/A",
          review_count: feedbackStats.review_count || 0,
          total_lessons: lessonStats.total_lessons || 0,
          member_since: memberSince,
        },
        messages,
      });
    } catch (error) {
      console.error("Error fetching tutor conversation:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Post tutor messages (in-chat)
exports.sendTutorMessage = async (req, res) => {
    const tutorId = req.user?.tutor_id;
    const { student_id, message_text } = req.body;
  
    if (!tutorId || !student_id || !message_text?.trim()) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    try {
      const [result] = await conn.query(
        `INSERT INTO messages (tutor_id, student_id, sender_role, message_text)
         VALUES (?, ?, 'tutor', ?)`,
        [tutorId, student_id, message_text.trim()]
      );
  
      res.status(201).json({
        message_id: result.insertId,
        tutor_id: tutorId,
        student_id,
        sender_role: "tutor",
        message_text: message_text.trim(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending tutor message:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get logged in tutor from JWT
exports.getLoggedInTutor = async (req, res) => {
    try {
      const tutorId = req.user?.tutor_id;
  
      if (!tutorId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      // Optional: Fetch full name or profile info
      const [rows] = await conn.query(
        `SELECT tutor_id, tutor_first_name, tutor_second_name, tutor_stripe_account_id FROM tutor WHERE tutor_id = ?`,
        [tutorId]
      );
  
      if (!rows.length) {
        return res.status(404).json({ error: "Tutor not found" });
      }
  
      res.status(200).json(rows[0]); // Returns tutor_id, first name, last name
    } catch (err) {
      console.error("Error fetching tutor details:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Post Tutor Holidays
exports.setTimeOff = async (req, res) => {
    const tutorId = req.user?.tutor_id;
    const { date, blockedSlots } = req.body;
  
    if (!tutorId || !date || !Array.isArray(blockedSlots)) {
      return res.status(400).json({ error: "Missing data" });
    }
  
    const connection = await conn.getConnection();
  
    try {
      await connection.beginTransaction();
  
      // Delete existing overrides for this tutor and date
      await connection.query(
        `DELETE FROM tutor_availability_override 
         WHERE tutor_id = ? AND override_date = ?`,
        [tutorId, date]
      );
  
      // Insert new overrides
      if (blockedSlots.length > 0) {
        const values = blockedSlots.map((time) => [
          date,
          time,
          0, // override_is_available = 0 (unavailable)
          new Date(), // override_created_at
          new Date(), // override_updated_at
          tutorId,
        ]);
  
        await connection.query(
          `INSERT INTO tutor_availability_override 
          (override_date, override_time_slot, override_is_available, override_created_at, override_updated_at, tutor_id)
          VALUES ?`,
          [values]
        );
      }
  
      await connection.commit();
      res.status(200).json({ message: "Time off updated successfully." });
    } catch (err) {
      await connection.rollback();
      console.error("Error saving time off:", err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      connection.release();
    }
  };

  // Tutor Stripe Setup
exports.connectStripeAccount = async (req, res) => {
    const tutorId = req.user.tutor_id;
  
    try {
      // Get tutor email + check Stripe account
      const [[{ tutor_email, tutor_stripe_account_id }]] = await conn.query(
        `SELECT tutor_email, tutor_stripe_account_id FROM tutor WHERE tutor_id = ?`,
        [tutorId]
      );
  
      if (tutor_stripe_account_id) {
        return res
          .status(400)
          .json({ message: "Stripe account already connected." });
      }
  
      // Create Stripe Express account
      const account = await stripe.accounts.create({
        type: "express",
        country: "GB",
        email: tutor_email,
        capabilities: {
          transfers: { requested: true },
        },
      });
  
      // Save Stripe account ID to DB
      await conn.query(
        `UPDATE tutor SET tutor_stripe_account_id = ? WHERE tutor_id = ?`,
        [account.id, tutorId]
      );
  
      const returnUrl = "http://localhost:5173/tutor/dashboard/profile";
  
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: returnUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });
  
      res.json({ url: accountLink.url });
    } catch (err) {
      console.error("Stripe Connect error:", err);
      res.status(500).json({ error: "Stripe connection failed." });
    }
  };