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
