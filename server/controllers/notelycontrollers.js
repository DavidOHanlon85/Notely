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
        selectSQL += " ORDER BY s.avg_rating DESC"
        break;
      case "experienceHighLow":
        selectSQL += " ORDER BY s.years_experience DESC"
        break;
      case "reviewsHighLow":
        selectSQL += " ORDER BY s.review_count DESC"
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

    // Fetch main tutor education
    const [education] = await conn.query(
      `SELECT qualification AS degree, institution, year
        FROM education
        WHERE tutor_id = ?
        ORDER BY year DESC
        `,
      [id]
    );

    // Fetch main tutor certificates
    const [certifications] = await conn.query(
      `SELECT certification AS name, year
        FROM certification
        WHERE tutor_id = ?
        ORDER BY year DESC
        `,
      [id]
    );

    // Fetch student feedback
    const [feedback] = await conn.query(
      `SELECT
          f.feedback_text,
          f.feedback_score,
          f.feedback_date,
          s.student_first_name AS student_name
        FROM student_feedback f
        JOIN student s ON f.student_id = s.student_id
        WHERE f.tutor_id = ?
        ORDER BY f.feedback_date DESC
        LIMIT 5
        `,
      [id]
    );

    // Fetch availability
    const [availabilityRows] = await conn.query(
      `SELECT day_of_week, time_slot
        FROM availability
        WHERE tutor_id = ? AND is_available = 1
        `,
      [id]
    );

    // Build structured availability object
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

    // Fetch stats
    const [stats] = await conn.query(
      `SELECT
        ROUND(AVG(f.feedback_score), 1) AS avg_rating,
        COUNT(f.feedback_id) AS review_count,
        COUNT(DISTINCT f.student_id) AS unique_students,
        TIMESTAMPDIFF(YEAR, t.tutor_teaching_start_date, CURDATE()) AS years_experience
      FROM tutor t
      LEFT JOIN student_feedback f ON f.tutor_id = t.tutor_id
      WHERE t.tutor_id = ?
      `, [id]
    );

    res.json({
      ...tutor[0],
      education,
      certifications,
      feedback,
      availability,
      stats: stats[0]
    });
  } catch (error) {
    console.error("Error fetching tutor by ID:", error);
    res.status(500).json({ error: "Internal server error " });
  }
};

// POST requests
