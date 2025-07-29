import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS features
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons features
import * as bootstrap from 'bootstrap'; // This enables all Bootstrap JS features


import './index.css'
import App from './App.jsx'

// Imported pages
import HomePage from './pages/HomePage.jsx'
import Profiles from './pages/Profiles.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilesPage from './pages/ProfilesPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import StaticProfilePage from './pages/StaticProfilePage.jsx'
import TutorProfilePage from './pages/TutorProfilePage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx';
import TutorBookingPage from './pages/TutorBookingPage.jsx';
import BookingSuccessPage from './pages/BookingSuccessPage.jsx';
import BookingSuccessPage2 from './pages/BookingSuccessPage2.jsx'
import StudentRegistrationPage from './pages/StudentRegistrationPage.jsx';
import StudentLoginPage from './pages/StudentLoginPage.jsx';
import DashboardDemo from './pages/DashboardDemo.jsx';
import StudentForgotPasswordPage from './pages/StudentForgotPasswordPage.jsx';
import StudentResetPasswordPage from './pages/StudentResetPasswordPage.jsx';
import TutorLoginPage from './pages/TutorLoginPage.jsx';
import TutorDemoDashboard from './pages/TutorDemoDashboard.jsx';
import TutorForgotPasswordPage from './pages/TutorForgotPasswordPage.jsx';
import TutorResetPasswordPage from './pages/TutorResetPasswordPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDemoDashboard from './pages/AdminDemoDashboard.jsx';
import AdminForgotPasswordPage from './pages/AdminForgotPasswordPage.jsx';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage.jsx';
import TutorRegistrationPage from './pages/TutorRegistration/TutorRegistrationPage.jsx';


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
  }
]);

// Render pages via router
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={ router } />
  </StrictMode>,
);
