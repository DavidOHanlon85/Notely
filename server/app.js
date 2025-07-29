const express = require('express'); // Express module loaded
const morgan = require('morgan'); // Morgan module loaded
//const dotenv = require('dotenv').config({ path: './config.env'}); // dotenv module loaded - loaded before the app object is created to allow access to env vars within the project without needing to be further required
const router = require('./routes/notelyroutes'); // Requiring the router object
const cookieParser = require("cookie-parser");
const app = express(); 
const path = require("path");

const cors = require("cors");

// Options to allow requests from frontend
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  };

// Accepting requests from React frontend
app.use(cors(corsOptions));

// Stripe requires raw body for webhook signature validation
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(morgan('tiny')); // Logger - tiny selected - format logs only the essential information

app.use(cookieParser()); // allows access to req.cookies
app.use(express.urlencoded({ extended: true })); // Allowing access to form data from the body of the HTTP post request

app.use(express.json());

app.use('/', router); // Mounting the router object to the default route path as middleware.

module.exports = app;



