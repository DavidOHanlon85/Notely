//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");

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
    const [defaultAvailability] = await conn.query(selectAvailabilitySQL, [tutor_id, dayOfWeek]);
    const slotLabels = defaultAvailability.map((row) => row.time_slot);

    // Step 3: Map slot labels to actual times
    const slotMap = {
      "Morning": ["07:00:00", "08:00:00", "09:00:00", "10:00:00", "11:00:00"],
      "Afternoon": ["12:00:00", "13:00:00", "14:00:00"],
      "After School": ["15:00:00", "16:00:00", "17:00:00"],
      "Evening": ["18:00:00", "19:00:00", "20:00:00", "21:00:00", "22:00:00"],
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
      new Date(`1970-01-01T${row.override_time_slot}`).toTimeString().slice(0, 8)
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
    const [weeklyAvailability] = await conn.query(selectWeeklyAvailabilitySQL, [tutor_id]);

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
      const [overrides] = await conn.query(selectOverridesSQL, [tutor_id, yyyyMmDd]);
      const overriddenTimes = overrides.map(row =>
        new Date(`1970-01-01T${row.override_time_slot}`).toTimeString().slice(0, 8)
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
      const [bookings] = await conn.query(selectBookingsSQL, [tutor_id, yyyyMmDd]);

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

// POST requests

// Creates a booking for a student

exports.createBooking = async (req, res) => {

  try {
    const {
      tutor_id,
      student_id,
      booking_date,
      booking_time,
      booking_notes
    } = req.body;

    console.log(req.body);

    if(!tutor_id || !student_id || !booking_date || !booking_time) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Preventing double booking 
    const checkSQL =`
    SELECT * FROM booking
    WHERE tutor_id = ? AND booking_date = ? AND booking_time = ? AND booking_status IN (1, 2)
    `;
    const [existing] = await conn.query(checkSQL, [tutor_id, booking_date, booking_time])

    console.log(existing);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Time slot already booked" })
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
      booking_notes || ""
    ]);

    res.status(201).json({ message: "Booking created successfully" })
  } catch (error) {
    console.log ("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error"});
  }
};