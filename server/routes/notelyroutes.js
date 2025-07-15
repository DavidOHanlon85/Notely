// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const controller = require('./../controllers/notelycontrollers');
const router = express.Router();

router.get('/users', controller.users);
router.get('/api/tutors', controller.tutors);
router.get('/api/tutors/distinct-fields', controller.distinctFields);
router.get('/api/tutor/:id', controller.getTutorById);
router.get('/api/booking/availability', controller.getAvailability);
router.get('/api/booking/available-dates', controller.getAvailableDates);

router.post("/api/booking/create", controller.createBooking);

module.exports = router;