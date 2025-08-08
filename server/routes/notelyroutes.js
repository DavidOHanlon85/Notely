// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { registerLimiter, authLimiter, loginLimiter } = require('../middlewares/rateLimiter')
const { verifyStudent, verifyTutor, verifyAdmin, verifyUser } = require('../middlewares/authMiddleware')
const upload = require('../utils/multerConfig');
const controller = require('./../controllers/notelycontrollers');

router.get('/users', controller.users);
router.get('/api/tutors', controller.tutors);
router.get('/api/tutors/distinct-fields', controller.distinctFields);
router.get('/api/instruments/all', controller.getAllInstruments);

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

router.post('/api/tutor/upload-image', upload.single("image"), controller.handleTutorImageUpload);

// Student Dashboard

// Bookings
router.get('/api/student/bookings', verifyStudent, controller.getStudentBookings);
router.patch('/api/booking/:id/cancel', controller.cancelBooking);

// My Profile
router.get('/api/student/profile', verifyStudent, controller.getStudentById);
router.patch('/api/student/profile', verifyStudent, controller.updateStudentProfile);

// Submit Feedback for Tutor

router.get('/api/booking/:bookingId/details', controller.getBookingDetails);
router.post('/api/feedback', verifyStudent, controller.submitFeedback);

// Get Personal Feedback

router.get('/api/student/feedback', verifyStudent, controller.getStudentFeedback);

// Get dashboard overview

router.get('/api/student/overview', verifyStudent, controller.getStudentDashboardSummary)

// Get student messages overview

router.get('/api/student/messages', verifyStudent, controller.getStudentConversations);

// Student Messagaing
router.get('/api/student/me', verifyStudent, controller.getLoggedInStudent);
router.get("/api/messages/:tutorId", verifyStudent, controller.getMessagesForTutor);
router.post('/api/messages/send', verifyStudent, controller.sendMessage);

// Tutor Dashboard

// Overview
router.get('/api/tutor/overview', verifyTutor, controller.getTutorOverview);

// Bookings
router.get("/api/tutor/bookings", verifyTutor, controller.getTutorBookings);
router.get('/api/tutor/booking/:bookingId/details', verifyTutor, controller.getTutorBookingDetails);
router.patch('/api/tutor/booking/:id/cancel', verifyTutor, controller.tutorCancelBooking);
router.post('/api/tutor/feedback', verifyTutor, controller.postTutorFeedback);

// Reviews
router.get("/api/tutor/reviews", verifyTutor, controller.getTutorReviews);

// Tutor Messaging
router.get('/api/tutor/messages', verifyTutor, controller.getTutorMessages);
router.get('/api/tutor/messages/:student_id', verifyTutor, controller.getTutorConversation);
router.post("/api/tutor/messages/send", verifyTutor, controller.sendTutorMessage);

// Tutor Manage Time Off
router.get("/api/tutor/me", verifyTutor, controller.getLoggedInTutor);
router.post('/api/tutor/timeoff/set', verifyTutor, controller.setTimeOff);

// Tutor Profile
router.post('/api/tutor/stripe/connect', verifyTutor, controller.connectStripeAccount);

// Admin Dashboard

// Overview 
router.get("/api/admin/me", verifyAdmin, controller.getLoggedInAdmin);
router.get('/api/admin/overview', verifyAdmin, controller.getAdminOverview);

// Tutor Table
router.get('/api/admin/tutors', verifyAdmin, controller.getAllTutorsForAdmin);
router.patch('/api/admin/tutor/:tutorId/verify', verifyAdmin, controller.verifyTutor);
router.patch('/api/admin/tutor/:tutorId/revoke', verifyAdmin, controller.revokeTutor);
router.post('/api/admin/tutor/:tutorId/stripe-reminder', verifyAdmin, controller.sendStripeReminder);

// Students Table
router.get('/api/admin/students', verifyAdmin, controller.getAllStudents);
router.patch('/api/admin/student/:studentId/verify', verifyAdmin, controller.verifyStudent);
router.patch('/api/admin/student/:studentId/revoke', verifyAdmin, controller.revokeStudent);

// Moved below to allow tutor/overview
router.get('/api/tutor/:id', controller.getTutorById);

// Jitsu Video Calls

router.get('/api/booking/:booking_id', verifyUser, controller.getBookingById);



module.exports = router;