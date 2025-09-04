# Notely Web App — README

## Project Overview

Notely is a web application that connects students with music tutors. The client provides search and discovery, tutor profiles, booking flows, messaging, and role-specific dashboards (student, tutor, admin). The UI emphasises clear information design, responsive layouts, and accessible interactions, and integrates tightly with the Notely REST API.

---

## Features
- **Student & Tutor onboarding** — short student form; multi-step tutor wizard with persisted progress.
- **Search & discovery** — collapsible, glassmorphic filters; instrument/city datasets; debounce; sort & pagination.
- **Tutor profiles** — qualifications, availability visualisation, integrated map, credibility badges.
- **Booking** — date/time selection, confirmation flow, success screen; “Join class” window logic.
- **Messaging** — in-app conversations between students and tutors.
- **Dashboards** — role-specific views (student/tutor/admin) with tables and charts.
- **Feedback & reviews** — star ratings, written feedback, dedicated tutor feedback page, with an assessment-for-learning reporting system for students.
- **Accessibility & UX** — keyboard navigation, sensible focus order, Lighthouse-checked pages.

---

## Technologies Used
- **Frontend**: React (Vite), React Router, Axios
- **Charts**: Recharts 
- **Tables**: DataTables.js
- **Styling**: CSS modules / utility classes (project styles), responsive layouts
- **Build**: Vite

---

## Installation and Setup

1. Download the Repository
2. Install dependencies
```bash 
npm install
```
3.  Environment variables:
VITE_API_URL = http://localhost:3002
4. Run the web application:
```bash 
npm run dev
```
5. Access the Application
Go to http://localhost:5173 in your browser

---

## Demo Accounts (local)

If you've loaded the API seed data use:
- Student: davidohanlon85@googlemail.com / ABCabc12!
- Tutor: davidohanlon85@googlemail.com  / Test1234!
- Admin: davidohanlon85@googlemail.com / ABCabc12!
(In production, users would typically hold a single role; multiple roles are only present here for demonstration purposes due to the database schema.)

---

## Security and Privacy (client-side context)

- Auth relies on HTTP-only JWT cookies set by the server; the client reads role and renders appropriate navigation/dashboards.
- Forms implement client-side validation for UX; server-side validation is authoritative.
- Uploads (e.g., profile image) are validated on the server (Multer: MIME/size). The client shows previews and friendly errors.
- Endpoints are rate-limited and validated server-side, aligning with OWASP guidelines

---

## Testing

Unit/ Component - Vitest
```bash 
npx vitest
```
End-to-End - Cypress
```bash 
npx cypress open
```

---

## Notes

- The client expects the API to be running CORS to allow the frontend origin (http://localhost:5173 by default)

---

## Author

Dáithí Ó hAnluain / David O'Hanlon
