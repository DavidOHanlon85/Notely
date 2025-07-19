// lib/stripe.js
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // load from .env

module.exports = stripe;