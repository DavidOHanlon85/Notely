//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");
const stripe = require("./../lib/stripe");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

// GET requests

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

// Get data required to complete datasets for instrument and city

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

// Gets student details to for Profile Update Form

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

// Gets Booking information for Student

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
      const key = d.toISOString().slice(0, 7); // YYYY-MM
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

    res.json({
      totalLessons: lessonStats[0].total,
      upcomingLessons: lessonStats[0].upcoming,
      completedLessons: lessonStats[0].completed,
      feedbackGiven: feedbackCount[0].feedback_given,
      lessonsPerMonth,
      feedbackStars,
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
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
    const timeFilter = interval ? `AND booking_date >= NOW() - ${interval}` : "";

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
       WHERE tutor_id = ? ${interval ? `AND feedback_date >= CURDATE() - ${interval}` : ""}`,
      [tutorId]
    );

    const [starCounts] = await conn.query(
      `SELECT feedback_score AS rating, COUNT(*) AS count
       FROM student_feedback
       WHERE tutor_id = ? ${interval ? `AND feedback_date >= CURDATE() - ${interval}` : ""}
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

// Get tutor review details

exports.getTutorReviews = async (req, res) => {
  try {
    const tutorId = req.user?.tutor_id;

    if (!tutorId) {
      return res.status(401).json({ error: "Unauthorized: tutor not logged in" });
    }

    const [rows] = await conn.query(
      `
      SELECT 
        DATE_FORMAT(sf.feedback_date, '%d %M %Y') AS date,
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

// Get tutor bookings

exports.getTutorBookings = async (req, res) => {
  try {
    const tutorId = req.user?.tutor_id;

    if (!tutorId) {
      return res.status(401).json({ error: "Unauthorized: tutor not logged in" });
    }

    const [rows] = await conn.query(
      `
      SELECT 
        b.booking_id,
        b.booking_date,
        b.booking_time,
        b.booking_link,
        s.student_first_name,
        s.student_last_name,
        s.student_id,
        CASE 
          WHEN sf.feedback_id IS NOT NULL THEN 1
          ELSE 0
        END AS feedback_given
      FROM booking b
      JOIN student s ON b.student_id = s.student_id
      LEFT JOIN student_feedback sf ON sf.booking_id = b.booking_id
      WHERE b.tutor_id = ?
        AND b.booking_status = 2
      ORDER BY TIMESTAMP(b.booking_date, b.booking_time) DESC
      `,
      [tutorId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching tutor bookings:", err.message);
    res.status(500).json({ error: "Internal server error" });
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
        to: "davidohanlon85@googlemail.com", //student_email,
        subject: "🎵 Booking Confirmed — Your Notely Lesson",
        html: `
          <p>Hi ${student_first_name},</p>
          <p>Your lesson with ${tutor_first_name} ${tutor_second_name} has been confirmed for <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>
          <p>Thanks for using Notely!</p>
        `,
      });

      // Email to tutor
      await sendEmail({
        to: "davidohanlon85@googlemail.com", //tutor_email,
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

// Gets initial Student Dashboard data

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

// Gets initial Tutor Dashboard data

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

// Gets initial Admin Dashboard data

exports.getAdminDashboard = (req, res) => {
  const { admin_id, admin_first_name } = req.user;
  return res.status(200).json({
    admin_id,
    admin_first_name,
    message: "Welcome to your admin dashboard!",
  });
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

// Cancels booking fo student

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
      booking_id
    ]);

    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Server error submitting feedback" });
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
      return res.status(404).json({ error: "Booking not found or already cancelled." });
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
    feedback_date
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