import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS features
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons features
import * as bootstrap from 'bootstrap'; // This enables all Bootstrap JS features


import './index.css'
import App from './App.jsx'

// Imported pages

// Admin Dashboard
import AdminDashboardLayout from './pages/AdminDashboard/AdminDashboardLayout.jsx';
import AdminOverview from './pages/AdminDashboard/AdminOverview.jsx';
import AdminStudents from './pages/AdminDashboard/AdminStudents.jsx';
import AdminTutors from './pages/AdminDashboard/AdminTutors.jsx';

// Admin Login and Password Reset
import AdminForgotPasswordPage from './pages/AdminLoginAndPasswordReset/AdminForgotPasswordPage.jsx';
import AdminLoginPage from './pages/AdminLoginAndPasswordReset/AdminLoginPage.jsx';
import AdminResetPasswordPage from './pages/AdminLoginAndPasswordReset/AdminResetPasswordPage.jsx';

// Booking
import BookingSuccessPage from './pages/Booking/BookingSuccessPage.jsx';
import TutorBookingPage from './pages/Booking/TutorBookingPage.jsx';

// Feedback
import StudentFeedbackForm from './pages/Feedback/StudentFeedbackPage.jsx';
import TutorFeedbackPage from './pages/Feedback/TutorFeedbackPage.jsx';

// Messaging
import MessagePage from './pages/Messgaing/MessagePage.jsx';
import TutorMessagePage from './pages/Messgaing/TutorMessagePage.jsx';

// Public Pages
import FeedbackPage from './pages/PublicPages/FeedbackPage.jsx';
import HomePage from './pages/PublicPages/HomePage.jsx'
import NotFoundPage from './pages/PublicPages/NotFoundPage.jsx';
import SearchPage from './pages/PublicPages/SearchPage.jsx';
import TutorHomePage from './pages/PublicPages/TutorHomePage.jsx';
import TutorProfilePage from './pages/PublicPages/TutorProfilePage.jsx'

// Student Dashbaord
import StudentBookings from './pages/StudentDashboard/StudentBookings.jsx';
import StudentDashboardLayout from './pages/StudentDashboard/StudentDashboardLayout.jsx';
import StudentFeedback from './pages/StudentDashboard/StudentFeedback.jsx';
import StudentMessages from './pages/StudentDashboard/StudentMessages.jsx';
import StudentOverview from './pages/StudentDashboard/StudentOverview.jsx';
import StudentProfile from './pages/StudentDashboard/StudentProfile.jsx';

// Student Login, Registration and Password Reset
import StudentForgotPasswordPage from './pages/StudentLoginRegistrationAndPasswordReset/StudentForgotPasswordPage.jsx';
import StudentLoginPage from './pages/StudentLoginRegistrationAndPasswordReset/StudentLoginPage.jsx';
import StudentRegistrationPage from './pages/StudentLoginRegistrationAndPasswordReset/StudentRegistrationPage.jsx';
import StudentResetPasswordPage from './pages/StudentLoginRegistrationAndPasswordReset/StudentResetPasswordPage.jsx';

// Tutor Dashboard
import TutorBookings from './pages/TutorDashboard/TutorBookings.jsx';
import TutorDashboardLayout from './pages/TutorDashboard/TutorDashboardLayout.jsx';
import TutorFeedback from './pages/TutorDashboard/TutorFeedback.jsx';
import TutorMessages from './pages/TutorDashboard/TutorMessages.jsx';
import TutorOverride from './pages/TutorDashboard/TutorOverride.jsx';
import TutorOverview from './pages/TutorDashboard/TutorOverview.jsx';
import TutorProfile from './pages/TutorDashboard/TutorProfile.jsx';

// Tutor Login and Password Reset
import TutorForgotPasswordPage from './pages/TutorLoginAndPasswordReset/TutorForgotPasswordPage.jsx';
import TutorLoginPage from './pages/TutorLoginAndPasswordReset/TutorLoginPage.jsx';
import TutorResetPasswordPage from './pages/TutorLoginAndPasswordReset/TutorResetPasswordPage.jsx';

// Tutor Registration
import TutorRegistrationPage from './pages/TutorRegistration/TutorRegistrationPage.jsx';

// Video Calling
import JoinPage from './pages/VideoCalling/JoinPage.jsx';



import Profiles from './pages/Profiles.jsx';
import ProfilesPage from './pages/ProfilesPage.jsx';
import StaticProfilePage from './pages/StaticProfilePage.jsx'


import BookingSuccessPage2 from './pages/BookingSuccessPage2.jsx'
import DashboardDemo from './pages/DashboardDemo.jsx';
import TutorDemoDashboard from './pages/TutorDemoDashboard.jsx';

import AdminDemoDashboard from './pages/AdminDemoDashboard.jsx';

























// Creating a router
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/tutors',
    element: <SearchPage />,
    errorElement: <NotFoundPage />
  },
  { 
    path: '/tutor/:id',
    element: <TutorProfilePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/feedback/:id',
    element: <FeedbackPage />
  },
  {
    path: '/student/register',
    element: <StudentRegistrationPage />
  },
  {
    path: '/student/login',
    element: <StudentLoginPage />
  },
  {
    path: '/student/dashboard/:id',
    element: <DashboardDemo />
  },
  {
    path: '/student/forgot-password',
    element: <StudentForgotPasswordPage />
  },
  {
    path: '/student/reset-password/:token',
    element: <StudentResetPasswordPage />
  },
  {
    path: '/tutor/register',
    element: <TutorRegistrationPage />
  },
  {
    path: '/tutor/login',
    element: <TutorLoginPage />
  },
  {
    path: "/tutor/dashboard/:tutorId",
    element: <TutorDemoDashboard />
  },
  {
    path: '/tutor/forgot-password',
    element: <TutorForgotPasswordPage />
  },
  {
    path: '/tutor/reset-password/:token',
    element: <TutorResetPasswordPage />
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />
  },
  {
    path: "/admin/dashboard/:id",
    element: <AdminDemoDashboard />
  },
  {
    path: '/admin/forgot-password',
    element: <AdminForgotPasswordPage />
  },
  {
    path: '/admin/reset-password/:token',
    element: <AdminResetPasswordPage />
  },
  {
    path: '/booking/:id',
    element: <TutorBookingPage />
  },
  {
    path: '/booking-success',
    element: <BookingSuccessPage />
  },
  {
    path: '/booking-success-2',
    element: <BookingSuccessPage2 />
  },
  {
    path: "/staticprofile",
    element: <StaticProfilePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: "/profiles",
    element: <Profiles />
  },
  {
    path: "/profiles/:profileId",
    element: <ProfilesPage />
  },
  {
    path: '/student/dashboard',
    element: <StudentDashboardLayout />,
    children: [
      { index: true, element: <StudentOverview /> },
      { path: 'bookings', element: <StudentBookings /> },
      { path: 'feedback', element: <StudentFeedback /> },
      { path: 'profile', element: <StudentProfile /> },
      { path: 'messages', element: <StudentMessages /> }
    ]
  },
  {
    path: '/student/feedback/:booking_id',
    element: <StudentFeedbackForm />
  },
  {
    path: '/student/messages/:tutorId',
    element: <MessagePage />
  },
  {
    path: '/tutor/dashboard',
    element: <TutorDashboardLayout />,
    children: [
      { index: true, element: <TutorOverview /> },
      { path: 'bookings', element: <TutorBookings /> },
      { path: 'feedback', element: <TutorFeedback /> },
      { path: 'profile', element: <TutorProfile /> },
      { path: 'messages', element: <TutorMessages /> },
      { path: 'timeoff', element: <TutorOverride /> }
    ]
  },
  {
    path: '/tutor/feedback/:booking_id',
    element: <TutorFeedbackPage />
  },
  {
    path: '/tutor/messages/:student_id',
    element: <TutorMessagePage />
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardLayout />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'tutors', element: <AdminTutors /> },
      { path: 'students', element: <AdminStudents /> },
    ]
  },
  {
    path: '/join/:booking_id',
    element: <JoinPage />
  },
  {
    path: '/home/tutor',
    element: <TutorHomePage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  },
]);

// Render pages via router
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={ router } />
  </StrictMode>,
);
