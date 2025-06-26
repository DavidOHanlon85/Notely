import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css'
import App from './App.jsx'

// Imported pages
import HomePage from './pages/HomePage.jsx'
import Profiles from './pages/Profiles.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilesPage from './pages/ProfilesPage.jsx';


// Creating a router
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
