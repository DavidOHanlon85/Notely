import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorRegisterStep1 from "../../components/TutorRegistration/TutorRegisterStep1";
import TutorRegisterStep2 from "../../components/TutorRegistration/TutorRegisterStep2";
import TutorRegisterStep3 from "../../components/TutorRegistration/TutorRegisterStep3";
import TutorRegisterStep4 from "../../components/TutorRegistration/TutorRegisterStep4";
import TutorRegisterStep5 from "../../components/TutorRegistration/TutorRegisterStep5";
import TutorRegisterStep6 from "../../components/TutorRegistration/TutorRegisterStep6";
import TutorRegisterStep7 from "../../components/TutorRegistration/TutorRegisterStep7";

import StepCircleIndicator from "../../components/TutorRegistration/RegistrationComponents/StepCircleIndicator";
import ProgressBar from "../../components/TutorRegistration/RegistrationComponents/ProgressBar";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";

// Hero images per step
import heroImageStep1 from "../../assets/images/LoginAndRegistration/StudentLogin.jpg";
import heroImageStep2 from "../../assets/images/LoginAndRegistration/StudentRegistration.jpg";
import heroImageStep3 from "../../assets/images/LoginAndRegistration/StudentForgotPassword.jpg";
import heroImageStep4 from "../../assets/images/LoginAndRegistration/StudentResetPassword.jpg";
import heroImageStep5 from "../../assets/images/LoginAndRegistration/StudentRegistration.jpg";
import heroImageStep6 from "../../assets/images/LoginAndRegistration/Test4.jpg";
import heroImageStep7 from "../../assets/images/LoginAndRegistration/StudentLogin.jpg";

import axios from "axios";

export default function TutorRegistrationPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errorMessages, setErrorMessages] = useState([]);
  const [submissionError, setSubmissionError] = useState("");

  // Final submission handler
  const handleTutorSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:3002/api/tutor/register", formData);
      console.log("Registration successful", res.data);
      setSubmissionError(""); // clear any previous errors

      // Redirect to login page with success query param
      navigate("/tutor/login?success=true");
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        setSubmissionError(backendErrors.join(" "));
      } else {
        setSubmissionError("Registration failed. Please try again.");
      }
      console.error("Registration failed:", err.response?.data || err.message);
    }
  };

  const handleNext = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  // Steps Configuration
  const stepConfigs = [
    {
      component: (
        <TutorRegisterStep1
          onNext={handleNext}
          formData={formData}
          setFormData={setFormData}
        />
      ),
      title: "Create Your Tutor Account",
      heroImage: heroImageStep1,
    },
    {
      component: (
        <TutorRegisterStep2
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      ),
      title: "Studio Location & Profile Image",
      heroImage: heroImageStep2,
    },
    {
      component: (
        <TutorRegisterStep3
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      ),
      title: "Your Teaching Profile",
      heroImage: heroImageStep3,
    },
    {
      component: (
        <TutorRegisterStep4
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      ),
      title: "Education & Certifications",
      heroImage: heroImageStep4,
    },
    {
      component: (
        <TutorRegisterStep5
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      ),
      title: "About You",
      heroImage: heroImageStep5,
    },
    {
      component: (
        <TutorRegisterStep6
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      ),
      title: "Availability & Payments",
      heroImage: heroImageStep6,
    },
    {
      component: (
        <TutorRegisterStep7
          formData={formData}
          onBack={handleBack}
          onSubmit={handleTutorSubmit}
          submissionError={submissionError}
        />
      ),
      title: "Confirm Your Details",
      heroImage: heroImageStep7,
    },
  ];

  const totalSteps = stepConfigs.length;
  const { component: StepComponent, title, heroImage } = stepConfigs[currentStep - 1];

  return (
    <div className="container-fluid tutor-register-page">
      <div className="row min-vh-100">
        {/* Left column: Form & Progress */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center form-section px-4">
          {/* Logo */}
          <img
            src={NotelyRectangle}
            alt="Notely Logo"
            className="notely-logo mb-1"
          />

          {/* Page title */}
          <h1 className="register-header pb-2 mb-1 mt-1">{title}</h1>

          {/* Step indicators */}
          <StepCircleIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepClick={handleStepClick}
          />
          {/* Left in as alternative to Step Indicators
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          */}


          {/* Current step form */}
          {StepComponent}
        </div>

        {/* Right column: Hero image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src={heroImage}
            alt={`Step ${currentStep} Hero`}
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}