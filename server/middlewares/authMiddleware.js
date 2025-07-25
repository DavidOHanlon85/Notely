const jwt = require("jsonwebtoken");

exports.verifyStudent = (req, res, next) => {
  console.log("Cookies received in middleware:", req.cookies);

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not suthenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check if user is a student
    if (decoded.userType !== "student") {
      return res.status(403).json({ message: "Access denied: not a student" });
    }

    // check if token matches the requesred ID
    const requestedId = parseInt(req.params.id);
    if (decoded.student_id !== requestedId) {
      return res.status(403).json({ message: "Access denied: ID mismatch" });
    }

    // Store user info for future use

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.verifyTutor = (req, res, next) => {
  console.log("Cookies received in tutor middleware:", req.cookies);

  const token = req.cookies.tutor_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is a tutor
    if (decoded.userType !== "tutor") {
      return res.status(403).json({ message: "Access denied: not a tutor" });
    }

    // Check if token matches the requested tutor ID
    const requestedId = parseInt(req.params.id);
    if (decoded.tutor_id !== requestedId) {
      return res.status(403).json({ message: "Access denied: ID mismatch" });
    }

    // Store decoded tutor info in req.tutor
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.verifyAdmin = (req, res, next) => {
  console.log("Cookies received in admin middleware:", req.cookies);

  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is an admin
    if (decoded.userType !== "admin") {
      return res.status(403).json({ message: "Access denied: not an admin" });
    }

    // Check if token matches the requested admin ID
    const requestedId = parseInt(req.params.id);
    if (decoded.admin_id !== requestedId) {
      return res.status(403).json({ message: "Access denied: ID mismatch" });
    }

    // Store decoded admin info in req.user
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
