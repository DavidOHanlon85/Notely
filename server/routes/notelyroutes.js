// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { registerLimiter, authLimiter, loginLimiter } = require('../middlewares/rateLimiter')
const { verifyStudent, verifyTutor, verifyAdmin, verifyUser } = require('../middlewares/authMiddleware')
const upload = require('../utils/multerConfig');
const uploadDocs = require('../utils/multerDocs');
const general = require('./../controllers/generalController');
const admin = require('./../controllers/adminController');
const student = require('./../controllers/studentController');
const tutor = require('./../controllers/tutorController');

// General Controller Routes + Public Routes
router.get('/users', general.users);
router.get('/api/instruments/all', general.getAllInstruments);
router.post('/api/booking/create', general.createBooking);
router.get('/api/booking/availability', general.getAvailability);
router.get('/api/booking/available-dates', general.getAvailableDates);
router.post('/api/create-checkout-session', general.createCheckoutSession);
router.post('/api/stripe/webhook', express.raw({ type: "application/json" }), general.stripeWebhook);
  // Jitsu Video Calls
router.get('/api/booking/:booking_id', verifyUser, general.getBookingById);
  // Verifcation and Documentation Routes
router.post('/api/tutor/upload-image', upload.single("image"), general.handleTutorImageUpload);
  // List files
router.get('/api/tutor/verification/files', verifyTutor, general.getTutorVerificationDocs);
  // Upload files
router.post('/api/tutor/verification/upload', verifyTutor,
  uploadDocs.fields([
    { name: "dbs", maxCount: 3 },
    { name: "qualified", maxCount: 3 },
    { name: "sen", maxCount: 3 },
  ]), general.uploadTutorVerificationDocs);
  // Delete
router.delete('/api/tutor/verification/file/:filename', verifyTutor, general.deleteTutorVerificationDoc);

// Student Controller Routes
router.get('/api/student/me', verifyStudent, student.getLoggedInStudent);
router.post('/api/student/register', registerLimiter, student.registerStudent);
router.post('/api/student/login', loginLimiter, student.loginStudent);
router.post('/api/student/logout', student.logoutStudent);
router.post('/api/student/forgot-password', authLimiter, student.forgotPasswordStudent);
router.post('/api/student/reset-password/:token', authLimiter, student.resetPasswordStudent);
// Student Dashboard
  // Dashboard Summary
router.get('/api/student/overview', verifyStudent, student.getStudentDashboardSummary)
  // Submit Review of Tutors
router.get('/api/booking/:bookingId/details', student.getBookingDetails);
router.post('/api/feedback', verifyStudent, student.submitFeedback);
  // Bookings
router.get('/api/student/bookings', verifyStudent, student.getStudentBookings);
router.patch('/api/booking/:id/cancel', student.cancelBooking);
  // Profile
router.get('/api/student/profile', verifyStudent, student.getStudentById);
router.patch('/api/student/profile', verifyStudent, student.updateStudentProfile);
  // Student Messagaing
router.get('/api/student/messages', verifyStudent, student.getStudentConversations);
router.get("/api/messages/:tutorId", verifyStudent, student.getMessagesForTutor);
router.post('/api/messages/send', verifyStudent, student.sendMessage);
  // Personal Feedback
router.get('/api/student/feedback', verifyStudent, student.getStudentFeedback);

// Tutor Controller Routes
router.get('/api/tutors', tutor.tutors);
router.get('/api/tutors/distinct-fields', tutor.distinctFields);
router.post('/api/tutor/register', registerLimiter, tutor.registerTutor);
router.post('/api/tutor/login', loginLimiter, tutor.loginTutor);
router.post('/api/tutor/logout', tutor.logoutTutor);
router.post('/api/tutor/forgot-password', authLimiter, tutor.forgotPasswordTutor);
router.post('/api/tutor/reset-password/:token', authLimiter, tutor.resetPasswordTutor);

// Tutor Dashboard
  // Overview
router.get('/api/tutor/overview', verifyTutor, tutor.getTutorOverview);
  // Bookings
router.get("/api/tutor/bookings", verifyTutor, tutor.getTutorBookings);
router.get('/api/tutor/booking/:bookingId/details', verifyTutor, tutor.getTutorBookingDetails);
router.patch('/api/tutor/booking/:id/cancel', verifyTutor, tutor.tutorCancelBooking);
router.post('/api/tutor/feedback', verifyTutor, tutor.postTutorFeedback);
  // Reviews
router.get("/api/tutor/reviews", verifyTutor, tutor.getTutorReviews);
  // Tutor Messaging
router.get('/api/tutor/messages', verifyTutor, tutor.getTutorMessages);
router.get('/api/tutor/messages/:student_id', verifyTutor, tutor.getTutorConversation);
router.post("/api/tutor/messages/send", verifyTutor, tutor.sendTutorMessage);
  // Tutor Manage Time Off
router.get("/api/tutor/me", verifyTutor, tutor.getLoggedInTutor);
router.post('/api/tutor/timeoff/set', verifyTutor, tutor.setTimeOff);
  // Tutor Profile
router.post('/api/tutor/stripe/connect', verifyTutor, tutor.connectStripeAccount);

// Moved below to allow tutor/overview
router.get('/api/tutor/:id', tutor.getTutorById);

// Admin Controller Routes
router.post('/api/admin/login', loginLimiter, admin.loginAdmin);
router.post('/api/admin/logout', admin.logoutAdmin);
router.post('/api/admin/forgot-password', authLimiter, admin.forgotPasswordAdmin);
router.post('/api/admin/reset-password/:token', authLimiter, admin.resetPasswordAdmin);

// Admin Dashboard
  // Overview 
router.get("/api/admin/me", verifyAdmin, admin.getLoggedInAdmin);
router.get('/api/admin/overview', verifyAdmin, admin.getAdminOverview);
  // Tutor Table
router.get('/api/admin/tutors', verifyAdmin, admin.getAllTutorsForAdmin);
router.patch('/api/admin/tutor/:tutorId/verify', verifyAdmin, admin.verifyTutor);
router.patch('/api/admin/tutor/:tutorId/revoke', verifyAdmin, admin.revokeTutor);
router.post('/api/admin/tutor/:tutorId/stripe-reminder', verifyAdmin, admin.sendStripeReminder);
  // Students Table
router.get('/api/admin/students', verifyAdmin, admin.getAllStudents);
router.patch('/api/admin/student/:studentId/verify', verifyAdmin, admin.verifyStudent);
router.patch('/api/admin/student/:studentId/revoke', verifyAdmin, admin.revokeStudent);

  // Test Routes
router.get('/api/student/dashboard/:id', verifyStudent, general.getStudentDashboard); 
router.get('/api/tutor/dashboard/:id', verifyTutor, general.getTutorDashboard);
router.get('/api/admin/dashboard/:id', verifyAdmin, general.getAdminDashboard);

module.exports = router;