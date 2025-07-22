// middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 1, // limit each IP to 5 requests per windowMs
  message: {
    status: "failure",
    message: "Too many registration attempts from this IP, please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = registerLimiter;