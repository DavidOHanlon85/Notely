// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const router = express.Router();
const registerLimiter = require('../middlewares/rateLimiter')
const{ verifyStudent } = require('../middlewares/authMiddleware')
const controller = require('./../controllers/notelycontrollers');

router.get('/users', controller.users);
router.get('/api/tutors', controller.tutors);
router.get('/api/tutors/distinct-fields', controller.distinctFields);
router.get('/api/tutor/:id', controller.getTutorById);
router.get('/api/booking/availability', controller.getAvailability);
router.get('/api/booking/available-dates', controller.getAvailableDates);
router.get('/api/student/dashboard/:id', verifyStudent, (req, res) => { res.status(200).json({
    message: `Welcome to your dashboard, ${req.user.student_first_name}`,
    student_id: req.user.student_id
    })
}); 


router.post('/api/booking/create', controller.createBooking);
router.post('/api/create-checkout-session', controller.createCheckoutSession)
router.post('/api/stripe/webhook', express.raw({ type: "application/json" }), controller.stripeWebhook);
router.post('/api/student/register', registerLimiter, controller.registerStudent);
router.post('/api/student/login', controller.loginStudent);
router.post('/api/student/logout', controller.logoutStudent);
router.post('/api/student/forgot-password', controller.forgotPasswordStudent);
router.post('/api/student/reset-password/:token', controller.resetPasswordStudent);

module.exports = router;