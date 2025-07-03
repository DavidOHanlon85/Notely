import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import TestimonialCarousel from "../components/TestimonialCarousel";
import DoubleButtonNavBar from "../components/DoubleButtonNavBar";
import HomePageHeroSection from "../components/HomePageHeroSection";
import HomePageFeaturesSection from "../components/HomePageFeaturesSection";
import HomePageJourneySection from "../components/HomePageJourneySection";
import SocialsFooter from "../components/SocialsFooter";

export default function HomePage() {
  return (
    <div>
      {/* Home Page Navigation Bar */}
      <DoubleButtonNavBar />

      {/* Home Page Hero*/}
      <HomePageHeroSection />

      {/* Features Bar */}
      <HomePageFeaturesSection />

      {/* Your Journey Section */}
      <HomePageJourneySection />

      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      {/* Footer */}
      <SocialsFooter />
    </div>
  );
}
