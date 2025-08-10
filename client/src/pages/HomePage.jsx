import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import TestimonialCarousel from "../components/StudentHomePage/TestimonialCarousel";
import DoubleButtonNavBar from "../components/UI/DoubleButtonNavBar";
import HomePageHeroSection from "../components/StudentHomePage/HomePageHeroSection";
import HomePageFeaturesSection from "../components/StudentHomePage/HomePageFeaturesSection"
import HomePageJourneySection from "../components/StudentHomePage/HomePageJourneySection";
import SocialsFooter from "../components/UI/SocialsFooter";

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
