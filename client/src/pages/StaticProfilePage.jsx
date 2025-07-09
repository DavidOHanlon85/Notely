import React from "react";
import DoubleButtonNavBar from "../components/DoubleButtonNavBar";
import SocialsFooter from "../components/SocialsFooter";
import "./StaticProfilePage.css";

export default function StaticProfilePage() {
  const availability = {
    Morning: [false, true, true, false, true, true, true],
    Afternoon: [true, true, true, true, true, false, false],
    AfterSchool: [true, true, true, true, true, true, true],
    Evening: [true, false, true, false, true, true, true],
  };

  const education = [
    {
      degree: "BA (Hons) Music Performance",
      institution: "Dublin City University",
      year: 2012,
    },
    {
      degree: "PGCE Secondary Music",
      institution: "Ulster University",
      year: 2015,
    },
    {
      degree: "MA Music Education",
      institution: "Queen’s University Belfast",
      year: 2020,
    },
  ];

  const certifications = [
    {
      name: "ABRSM Grade 8 Guitar",
      year: 2014,
    },
    {
      name: "Level 3 Certificate in Graded Music Teaching",
      year: 2016,
    },
    {
      name: "Diploma in Music Pedagogy",
      year: 2018,
    },
    {
      name: "Safeguarding & Child Protection Training",
      year: 2021,
    },
  ];

  const feedback = [
    {
      name: "James B.",
      text: "Samantha has been a fantastic influence on my daughter. Her teaching style is inspiring and tailored to her needs.",
    },
    {
      name: "Emily R.",
      text: "After only a few weeks with Samantha, I already feel more confident playing and practicing at home.",
    },
    {
      name: "Leo M.",
      text: "Lessons are well structured and super engaging. Samantha breaks things down in a way that just clicks.",
    },
    {
      name: "Hannah K.",
      text: "Samantha's energy is infectious. I picked the guitar back up after years — and now I look forward to every lesson!",
    },
    {
      name: "Tom A.",
      text: "Samantha helped me prep for my GCSE performance — I scored way higher than I expected!",
    },
  ];

  const address = "16A Malone Rd, Belfast BT9 5BN";
  const mapQuery = encodeURIComponent(address);

  return (
    <div className="container py-4">
      <DoubleButtonNavBar />

      <div class="row">
        {/* Left Panel */}
        <div class="col-lg-7">
          <div class="card p-4 tutor-profile-card">
            <div class="row">
              {/* Profile Image and Price */}
              <div class="col-md-4 text-center">
                <div class="tutor-profile-photo mx-auto mb-4">
                  <img
                    src="../assets/images/TestimonialImages/Testimonial1.jpg"
                    alt="Samantha Williamson"
                    class="img-fluid rounded-circle border border-warning"
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h4 class="fw-bold mt-2"> £55/hr </h4>
              </div>

              {/* Information Section */}
              <div class="col-md-8 d-flex flex-column justify-content-between">
                <div>
                  <h1 class="h3">Samantha Williamson</h1>
                  <span class="badge bg-secondary mb-2">Guitar</span>

                  {/* Qualification Badges */}
                  <div class="mb-2">
                    <span class="badge bg-warning text-dark me-1">
                      Qualified Teacher
                    </span>
                    <span class="badge bg-warning text-dark me-1">
                      SEN Trained
                    </span>
                    <span class="badge bg-warning text-dark">
                      DBS Certified
                    </span>
                  </div>

                  {/* Stats */}
                  <ul class="list-unstyled mb-3">
                    <li>
                      <i class="bi bi-star-fill svg-icon"></i>
                      <strong> 5.0</strong> (69 reviews)
                    </li>
                    <li>
                      <i class="bi bi-clock-fill svg-icon"></i> 4050+ hours
                      taught
                    </li>
                    <li>
                      <i class="bi bi-person-circle svg-icon"></i> 124 Notely
                      students
                    </li>
                  </ul>
                </div>

                {/* CTAs */}
                <div class="d-flex gap-2">
                  <button class="btn btn-notely-gold fw-bold">Book Now</button>
                  <button className="btn btn-notely-outline-gold">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card p-4 mt-4">
            <h2 className="h5 mb-3">About Samantha</h2>
            <p>
              Samantha Williamson is a passionate musician and dedicated
              educator with over a decade of experience both on stage and in the
              classroom. From touring internationally as a session guitarist to
              leading workshops and 1-on-1 sessions, she brings an exceptional
              blend of real-world expertise and empathetic teaching. Her lessons
              are structured but never rigid — always tuned to the student’s
              goals, style, and personality.
            </p>

            <p>
              Known for her warm, encouraging style, Samantha makes every
              student feel like a rock star in the making. Whether you're
              picking up your first instrument or preparing for an advanced
              performance, her balance of creativity, technical guidance, and
              unwavering support helps students not only improve but thrive. If
              you’re looking for a teacher who inspires confidence and brings
              music to life, you’ve found her.
            </p>
          </div>

          {/* Availability Section */}

          <div className="card p-4 mt-4">
            <h2 className="h5 mb-3">Availability</h2>
            <div className="table-responsive">
              <table className="table text-center align-middle availability-table">
                <thead>
                  <tr>
                    <th></th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <th key={day}>{day}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(availability).map(([slot, values]) => (
                    <tr key={slot}>
                      <td className="text-start fw-medium">{slot}</td>
                      {values.map((available, idx) => (
                        <td key={idx}>
                          {available && (
                            <span className="notely-available-icon" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-lg-5">
          {/* Education */}
          <div className="card p-4 mb-4 mt-lg-0 mt-4">
            <h2 className="h5 mb-3">Education</h2>
            <ul className="list-unstyled mb-0">
              {education.map((degree, idx) => (
                <li className="mb-2 d-inline-flex align-items-start" key={idx}>
                  <img
                    src="../assets/images/svg/Degree.svg"
                    alt="Degree Icon"
                    className="notely-icon me-2 mt-0"
                  />
                  <span className="text-justify">
                    <strong>{degree.degree}</strong>, {degree.institution} (
                    {degree.year})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications */}
          <div className="card p-4 mb-4">
            <h2 className="h5 mb-3">Certifications</h2>
            <ul className="list-unstyled mb-0">
              {certifications.map((cert, idx) => (
                <li className="d-flex align-items-start gap-2 mb-2" key={idx}>
                  <img
                    className="notely-icon mt-0"
                    src="../assets/images/svg/Certificate.svg"
                    alt="Certificate Icon"
                  />
                  <span className="justify-text">
                    <strong>{cert.name}</strong> ({cert.year})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Feedback */}
          <div className="card p-4">
            <h2 className="h5 mb-0">Student Feedback</h2>

            <div
              id="carouselStudentFeedback"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              {/* Indicators */}
              <div className="carousel-indicators mb-0">
                {feedback.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    data-bs-target="#carouselStudentFeedback"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-current={index === 0 ? "true" : undefined}
                    aria-label={`Slide ${index + 1}`}
                  ></button>
                ))}
              </div>

              <div className="carousel-inner">
                {feedback.map((item, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                    key={index}
                  >
                    <div className="bg-light p-3 rounded text-center">
                      <blockquote className="blockquote mb-3">
                        <p className="fs-6 text-justify">“{item.text}”</p>
                      </blockquote>
                      <figcaption className="blockquote-footer">
                        <strong>{item.name}</strong>,{" "}
                        <cite>Notely student</cite>
                      </figcaption>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel controls */}
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselStudentFeedback"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselStudentFeedback"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          {/* Google Location */}

          <div className="card p-4 mt-4">
            <h2 className="h5 mb-4">My Studio</h2>
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                allowFullScreen="My Studio Location"
                loading="lazy"
                title="Tutor Location"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <SocialsFooter />
    </div>
  );
}
