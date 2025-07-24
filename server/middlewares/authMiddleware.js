const jwt = require("jsonwebtoken");

exports.verifyStudent = (req, res, next) => {
    console.log("Cookies received in middleware:", req.cookies);

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not suthenticated" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // check if user is a student
        if (decoded.userType !== "student"){
            return res.status(403).json({ message: "Access denied: not a student" })
        }

        // check if token matches the requesred ID
        const requestedId = parseInt(req.params.id);
        if (decoded.student_id !== requestedId) {
            return res.status(403).json({ message: "Access denied: ID mismatch" })
        }

        // Store user info for future use

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token"})
    }
}

