const rateLimit = require("express-rate-limit");

/**
 * registerLimiter
 * Limits student registration attempts to prevent spam and abuse.
 * Allows 10 attempts per IP per hour.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: "failure",
    message: "Too many registration attempts from this IP, please try again after an hour.",
  },
  handler: (req, res, next, options) => {
    console.warn(`Register rate limit hit: ${req.ip} ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * authLimiter
 * General limiter for sensitive actions (e.g., forgot/reset password).
 * Allows 10 attempts per IP every 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: "failure",
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    console.warn(`Auth rate limit hit: ${req.ip} ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * loginLimiter
 * Aggressively protects login routes against brute force attacks.
 * Allows only 5 login attempts per IP every 15 minutes.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: "failure",
    message: "Too many login attempts. Try again in 15 minutes.",
  },
  handler: (req, res, next, options) => {
    console.warn(`Login rate limit hit: ${req.ip} ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  registerLimiter,
  authLimiter,
  loginLimiter,
};