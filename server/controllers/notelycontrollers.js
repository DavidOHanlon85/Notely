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
    } = req.query;

    let selectSQL = "SELECT * FROM tutors WHERE 1 = 1";
    const params =[];

    if (instrument) {
      selectSQL += " AND instrument = ?";
      params.push(instrument);
    }

    if (level) {
      selectSQL += " AND (FIND_IN_SET(?, level) > 0 OR level = 'all')";
      params.push(level);
    }    

    if (tutorName) {
      selectSQL += " AND name LIKE ?"
      params.push(`%${tutorName}%`);
    }

    if (lessonType) {
      selectSQL += " AND (modality = ? OR modality = 'Hybrid')"
      params.push(lessonType);
    }

    if (price) {
      selectSQL += " AND price <= ?"
      params.push(price);
    }

    if (city) {
      selectSQL += " AND city = ?"
      params.push(city);
    }

    if (qualified) {
      selectSQL += " AND qualified = ?"
      params.push(qualified);
    }

    if (gender) {
      selectSQL += " AND gender = ?"
      params.push(gender);
    }

    if (sen) {
      selectSQL += " AND sen = ?"
      params.push(sen);
    }

    if (dbs) {
      selectSQL += " AND dbs = ?"
      params.push(dbs);
    }

    if (sortBy) {
      switch (sortBy) {
        case "priceLowHigh":
          selectSQL += " ORDER BY price ASC";
          break;
        case "priceHighLow":
          selectSQL += " ORDER BY price DESC";
          break;
        default:
          selectSQL += " ORDER BY id DESC"; // or rating/experience
          break;
      }
    }

    const [results] = await conn.query(selectSQL, params)
    res.json(results);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ error: "Internal server error "})
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
