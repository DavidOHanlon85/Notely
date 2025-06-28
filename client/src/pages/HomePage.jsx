import React from "react";
import UsersTest from "../components/UsersTest";
import { Link } from "react-router-dom";

export default function HomeTest() {
    return (
      <>
        {/* Navigation Bar */}
        <section>
          <div className="container">
            <header className="d-flex flex-wrap align-items-center justify-content-between py-3 mb-4 border-bottom">
              <div className="col-12 col-md-3 mb-2 mb-md-0 text-center text-md-start">
                <img src="/assets/images/tomato_logo.png" alt="Tomato Logo" width="160" height="40" />
              </div>
  
              <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
                <a href="/login" className="btn btn-outline-success me-2 mb-2 mb-md-0">Login</a>
                <a href="/register" className="btn btn-success mb-2 mb-md-0">Get Started</a>
              </div>
            </header>
          </div>
        </section>
  
        {/* Hero Bar */}
        <section id="hero">
          <div className="container">
            <div className="px-4 py-1 pt-1 my-3 text-center">
              {/* Logo */}
              <img className="d-block mx-auto mb-4" src="/assets/images/tomato_logo.png" alt="Tomato Logo" width="240" height="60" />
  
              {/* Header and Copy */}
              <h1 className="display-5 text-body-emphasis">Peak Productivity,</h1>
              <h1 className="display-5 text-body-emphasis">One Pomodoro at a Time.</h1>
              
              <div className="col-lg-6 mx-auto">
                <p className="lead mb-4">
                  Designed to streamline your workflow, Tomato makes productivity effortless with cutting-edge tools and intuitive design.
                  It's productivity reimagined—giving you the edge to turn big ideas into reality.
                </p>
  
                {/* Interactive Buttons */}
                <div className="btn-grid mx-auto w-75 d-flex gap-3 mb-3">
                  <button type="button" className="btn btn-outline-danger flex-grow-1">Goals</button>
                  <button type="button" className="btn btn-outline-danger flex-grow-1">Tasks</button>
                  <button type="button" className="btn btn-outline-danger flex-grow-1">Projects</button>
                </div>
  
                {/* Get Started Button with SVG Arrow */}
                <div className="d-grid gap-2 mt-4 d-sm-flex justify-content-sm-center">
                  <a href="/register" className="btn btn-success btn-lg px-4 d-flex align-items-center justify-content-center gap-2">
                    Get Started
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                      <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
                    </svg>
                  </a>
                </div>
  
                <p className="user-message">
                  No credit card needed - Unlimited time on Free Plan
                </p>
              </div>
            </div>
          </div>
          <div>
        <h1>Home Page</h1>
        <UsersTest />
      </div>
        </section>
      </>
    );
  }
