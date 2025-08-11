import React from "react";
import { Link } from "react-router-dom";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import SocialsFooter from "../../components/UI/SocialsFooter";
import TutorHomeNavBar from "../../components/TutorHomePage/TutorHomeNavBar";
import TutorHeroSection from "../../components/TutorHomePage/TutorHeroSection";
import TutorFeaturesSection from "../../components/TutorHomePage/TutorFeaturesSection";
import TutorJourneySection from "../../components/TutorHomePage/TutorJourneySection";
import "./TutorHomePage.css";

export default function TutorHomePage() {
  return (
    <div className="tutor-home">

        {/* Dynamic Nav Bar */}
        <TutorHomeNavBar />

        {/* Hero Section */}
        <TutorHeroSection />

        {/* Features */}
        <TutorFeaturesSection />
        
        {/* Journey */}
        <TutorJourneySection />

        {/* Footer */}
        <SocialsFooter />

    </div>
  );
}