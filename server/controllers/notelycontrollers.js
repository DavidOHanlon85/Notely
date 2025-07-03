//Route method handlers which will be exported as functions that can then be required and used in other modules/ files

const bcrypt = require("bcrypt");
const conn = require("./../utils/dbconn");

// GET requests

exports.users = async (req, res) => {
  try {
    const selectSQL = "SELECT user_id, user_username, user_email_address FROM user";
    const [rows] = await conn.query(selectSQL);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
};

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
    let selectSQL = "SELECT * FROM tutors WHERE 1 = 1";
    let countSQL = "SELECT COUNT(*) as count FROM tutors WHERE 1 = 1";

    const addFilter = (condition, value) => {
      selectSQL += condition;
      countSQL += condition;
      params.push(value);
    };

    if (instrument) addFilter(" AND instrument = ?", instrument);
    if (level) addFilter(" AND (FIND_IN_SET(?, level) > 0 OR level = 'all')", level);
    if (tutorName) addFilter(" AND name LIKE ?", `%${tutorName}%`);
    if (lessonType) addFilter(" AND (modality = ? OR modality = 'Hybrid')", lessonType);
    if (price) addFilter(" AND price <= ?", price);
    if (city) addFilter(" AND city = ?", city);
    if (qualified) addFilter(" AND qualified = ?", qualified);
    if (gender) addFilter(" AND gender = ?", gender);
    if (sen) addFilter(" AND sen = ?", sen);
    if (dbs) addFilter(" AND dbs = ?", dbs);

    // Add sorting
    switch (sortBy) {
      case "priceLowHigh":
        selectSQL += " ORDER BY price ASC";
        break;
      case "priceHighLow":
        selectSQL += " ORDER BY price DESC";
        break;
      default:
        selectSQL += " ORDER BY id DESC";
        break;
    }

    // Pagination logic
    const offset = (parseInt(page) - 1) * parseInt(limit);
    selectSQL += " LIMIT ? OFFSET ?";
    const finalParams = [...params, parseInt(limit), offset];

    // Run both queries
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

exports.distinctFields = async (req, res) => {
  try {
    const [instruments] = await conn.query("SELECT DISTINCT instrument FROM tutors ORDER BY instrument ASC");
    const [cities] = await conn.query("SELECT DISTINCT city FROM tutors ORDER BY city ASC");
    res.json( { instruments, cities })
  } catch (error) {
    console.error("Error fetching distinct fields:", error);
    res.status(500).json({ error: "Internal server error "})
  }
};

// POST requests
