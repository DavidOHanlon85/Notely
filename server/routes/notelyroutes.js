// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { registerLimiter, authLimiter, loginLimiter } = require('../middlewares/rateLimiter')
const{ verifyStudent, verifyTutor, verifyAdmin } = require('../middlewares/authMiddleware')
const upload = require('../utils/multerConfig');
const controller = require('./../controllers/notelycontrollers');

router.get('/users', controller.users);
router.get('/api/tutors', controller.tutors);
router.get('/api/tutors/distinct-fields', controller.distinctFields);
router.get('/api/instruments/all', controller.getAllInstruments);
router.get('/api/tutor/:id', controller.getTutorById);
router.get('/api/booking/availability', controller.getAvailability);
router.get('/api/booking/available-dates', controller.getAvailableDates);
router.get('/api/student/dashboard/:id', verifyStudent, controller.getStudentDashboard); 
router.get('/api/tutor/dashboard/:id', verifyTutor, controller.getTutorDashboard);
router.get('/api/admin/dashboard/:id', verifyAdmin, controller.getAdminDashboard);

router.post('/api/booking/create', controller.createBooking);
router.post('/api/create-checkout-session', controller.createCheckoutSession)
router.post('/api/stripe/webhook', express.raw({ type: "application/json" }), controller.stripeWebhook);

router.post('/api/student/register', registerLimiter, controller.registerStudent);
router.post('/api/student/login', loginLimiter,controller.loginStudent);
router.post('/api/student/logout', controller.logoutStudent);
router.post('/api/student/forgot-password', authLimiter,controller.forgotPasswordStudent);
router.post('/api/student/reset-password/:token', authLimiter,controller.resetPasswordStudent);

router.post('/api/tutor/register', registerLimiter, controller.registerTutor);
router.post('/api/tutor/login', loginLimiter, controller.loginTutor);
router.post('/api/tutor/logout', controller.logoutTutor);
router.post('/api/tutor/forgot-password', authLimiter, controller.forgotPasswordTutor);
router.post('/api/tutor/reset-password/:token', authLimiter, controller.resetPasswordTutor);

router.post('/api/admin/login', loginLimiter, controller.loginAdmin);
router.post('/api/admin/logout', controller.logoutAdmin);
router.post('/api/admin/forgot-password', authLimiter, controller.forgotPasswordAdmin);
router.post('/api/admin/reset-password/:token', authLimiter, controller.resetPasswordAdmin);

router.post("/api/tutor/upload-image", upload.single("image"), controller.handleTutorImageUpload);


module.exports = router;