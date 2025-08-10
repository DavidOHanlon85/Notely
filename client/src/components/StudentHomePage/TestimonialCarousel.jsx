import React from "react";
import "./TestimonialCarousel.css";

const testimonials = [
    {
      name: "Laura H.",
      role: "Adult Learner",
      text: "I always wanted to pick piano back up. Notely helped me find a tutor who tailored lessons to my goals — I’m prepping for Grade 3 now!",
      image: "/assets/images/TestimonialImages/Testimonial1.jpg"
    },
    {
      name: "Chloe M.",
      role: "Professional Voice Coach",
      text: "Notely is a breath of fresh air. The platform gives tutors like me a polished, professional way to connect with motivated learners.",
      image: "/assets/images/TestimonialImages/Testimonial2.jpg"
    },
    {
      name: "David R.",
      role: "Parent of 9-year-old drummer",
      text: "We struggled to find a reliable tutor locally. Notely matched us with someone fantastic — lessons are now the highlight of our week.",
      image: "/assets/images/TestimonialImages/Testimonial3.jpg"
    },
    {
      name: "Aidan S.",
      role: "Orchestral Coach",
      text: "From booking to profile verification, everything just works. Notely elevates what it means to teach music professionally.",
      image: "/assets/images/TestimonialImages/Testimonial4.jpg"
    },
    {
      name: "Meera T.",
      role: "Parent of a young learner",
      text: "I love how inclusive Notely is. We were able to find a tutor with SEN experience who totally understands how our son learns.",
      image: "/assets/images/TestimonialImages/Testimonial5.jpg"
    }
  ];
  

export default function TestimonialCarousel() {
  return (
    <section className="testimonial-carousel py-3">
      <div className="container">
        <h2 className="text-center mb-2">What Our Users Say</h2>
        <hr className="mx-auto mt-4" style={{ width: "80px", opacity: 0.25 }} />

        <div
          id="carouselExampleIndicators"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          {/* Indicators */}
          <div className="carousel-indicators mb-0">
            {testimonials.map((_, index) => (
              <button
                type="button"
                key={index}
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={index === 0 ? "true" : undefined}
                aria-label={`Slide ${index + 1}`}
              ></button>
            ))}
          </div>

          <div className="carousel-inner">
            {testimonials.map((item, index) => (
              <div
                className={`carousel-item ${index === 0 ? "active" : ""}`}
                key={index}
              >
                <div className="card shadow-sm p-2 text-center border-0 mx-auto testimonial-card pb-3">
                  <img
                    src={item.image}
                    className="testimonial-img rounded-circle mx-auto mb-3"
                    alt={item.name}
                  />
                  <blockquote className="blockquote mb-3">
                    <p className="fs-5">“{item.text}”</p>
                  </blockquote>
                  <figcaption className="blockquote-footer">
                    <strong>{item.name}</strong>, <cite>{item.role}</cite>
                  </figcaption>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel controls */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>
  );
}
