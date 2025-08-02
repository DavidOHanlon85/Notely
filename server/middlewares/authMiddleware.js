const jwt = require("jsonwebtoken");

// Middleware to verify that the student is authenticated and authorized to access certain pages
exports.verifyStudent = (req, res, next) => {
  console.log("Cookies received in middleware:", req.cookies);

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "student") {
      return res.status(403).json({ message: "Access denied: not a student" });
    }

    if (req.params.id && decoded.student_id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Access denied: ID mismatch" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify that the tutor is authenticated and authorized to access certain pages
exports.verifyTutor = (req, res, next) => {
  const token = req.cookies.tutor_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "tutor") {
      return res.status(403).json({ message: "Access denied: not a tutor" });
    }

    // 🔐 Only check tutor ID match if route includes tutor ID in params (it doesn't here)
    if (req.originalUrl.includes("/tutor/") && req.params?.id && req.originalUrl.includes("/tutor/:id")) {
      const requestedId = parseInt(req.params.id);
      if (isNaN(requestedId) || decoded.tutor_id !== requestedId) {
        return res.status(403).json({ message: "Access denied: ID mismatch" });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify that the admin is authenticated and authorized to access certain pages
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


