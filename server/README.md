# Notely API — README

## Project Overview

The Notely API powers the Notely web application, enabling secure interactions between students, tutors, and administrators. Built with **Node.js** and **Express.js**, it provides RESTful endpoints for registration, authentication, tutor discovery, bookings, messaging, feedback, and administrative oversight. The API was designed with a strong emphasis on security, scalability, and maintainability, following OWASP recommendations and an MVC structure.

---

## Features
- **Secure authentication** with bcrypt password hashing and JWT-based sessions (HTTP-only cookies).
- **Role-based access control** for students, tutors, and admins, enforced by Express middleware.
- **Tutor discovery** with filtering (instrument, city, SEN, availability).
- **Booking system** with double-booking prevention, Stripe integration, and automated reminders via cron jobs.
- **Messaging system** linking students and tutors with persistent conversations.
- **Feedback and reviews** linked to tutors and lessons.
- **Administrative functions** for tutor verification, student approval, and Stripe connection management.
- **Input validation** at both client and server levels.
- **Rate limiting** for sensitive routes (e.g., login, password reset).
- **File uploads** (credentials, profile pictures) validated via Multer (MIME type/size).

---

## Technologies Used
- **Backend:** Node.js, Express.js  
- **Database:** MySQL (MySQL2 driver)  
- **Authentication:** bcrypt (password hashing), JWT (token-based auth)  
- **Email & Scheduling:** Nodemailer + cron  
- **Payments:** Stripe API (with Connect for tutor payouts)  
- **Uploads:** Multer (server-side validation)  

---

## Installation and Setup

1. Clone or download the repository.  
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the database using the provided SQL schema file located at /sql/CSC7057assignment.sql
4. Configure environment variables by creating a .env file in the project root
    ```env
     PORT = 3002
    
    DB_HOST = localhost
    DB_USER = root
    DB_PASS = root
    DB_NAME = CSC7057assignment
    DB_PORT = 8889

    STRIPE_SECRET_KEY = your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET = your_webhook_secret

    EMAIL_USER = your_email
    EMAIL_PASS = your_email_password

    JWT_SECRET = your_jwt_secret
    ```
5. Run the API
```bash
npm start
```
6. Test endpoints using Postman or run automated test (Supertest)
```bash
npm run test
```

---

## Security and Privacy
- Passwords stored securely with bcrypt.
- JWTs issued per role (student_token, tutor_token, admin_token) with expiry.
- Middleware enforces role validation and protects routes.
- Rate limiting on authentication and password reset endpoints.
- SQL injection prevented via parameterised queries.
- File uploads restricted by MIME type and size.
- All responses return appropriate HTTP status codes.
- Consistent error payloads are returned in JSON format, typically { "status": "error", "message": "..." }, to aid frontend clarity.

## Error Handling

The API implements clear HTTP status codes:
- **200** – OK (successful request)
- **201** – Created (resource created)
- **204** – No Content (successful delete)
- **400** – Bad Request (validation failure)
- **401** – Unauthorized (invalid credentials/token)
- **403** – Forbidden (role mismatch or blocked access)
- **404** – Resource not found
- **409** – Conflict (duplicate resource)

---

## Notes

- The API is designed to work with the Notely React client (default URL http://localhost:5173).
- Ensure CORS is configured to allow the frontend origin.
- Demo accounts are available if you load the seed SQL data.

---

## Demo Accounts (local)

If you've loaded the API seed data, you can use the following demo accounts:
- Student: davidohanlon85@googlemail.com / ABCabc12!
- Tutor: davidohanlon85@googlemail.com  / Test1234!
- Admin: davidohanlon85@googlemail.com / ABCabc12!
(In production, users would typically hold a single role; multiple roles are only present here for demonstration purposes due to the database schema.)

---

## Future Improvements

- Cloud deployment (AWS/GCP/Azure) with containerisation.
- Full CI/CD pipeline (GitHub Actions, coverage thresholds).
- Penetration testing and recurring OWASP ZAP baseline scans.
- Migration of file storage to AWS S3 with CDN distribution.
- Optionally introduce GraphQL endpoints or richer REST aggregation for advanced querying.

---

## Author

Dáithí Ó hAnluain / David O'Hanlon