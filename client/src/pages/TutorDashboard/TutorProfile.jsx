import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./TutorProfile.css";

export default function TutorProfile() {
  const [tutorId, setTutorId] = useState(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/tutor/me", {
          withCredentials: true,
        });
        setTutorId(res.data.tutor_id);
        setStripeConnected(!!res.data.tutor_stripe_account_id);
      } catch (err) {
        console.error("Error fetching tutor data:", err);
      }
    };
    fetchTutorData();
  }, [location]);

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3002/api/tutor/stripe/connect",
        {},
        { withCredentials: true }
      );
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Error connecting to Stripe:", err);
      alert("Could not initiate Stripe connection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-profile__wrapper">
      <div className="tutor-profile__container py-0">
        <h2 className="tutor-profile__heading mb-4">My Profile</h2>

        {/* Stripe Connection Box */}
        <div className="card p-4 mb-4">
          <h5 className="mb-3">Connect to Stripe</h5>
          <p>
            Stripe is a{" "}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noreferrer"
              className="tutor-profile__link"
            >
              3rd Party Payment Platform
            </a>{" "}
            used to process payments on Notely. Connecting your account ensures
            you can be paid securely for each lesson.
          </p>
          <button
            className={
              stripeConnected
                ? "tutor-profile__stripe-connected"
                : "btn btn-notely-purple"
            }
            onClick={handleConnectStripe}
            disabled={stripeConnected || loading}
          >
            {stripeConnected ? (
              <>
                <i className="bi bi-check-circle-fill me-2"></i>
                Stripe Connected
              </>
            ) : loading ? (
              "Connecting..."
            ) : (
              "Connect to Stripe"
            )}
          </button>
        </div>

        {/* Profile Update Box */}
        <div className="card p-4 mb-4">
          <h5 className="mb-3">Update Your Profile</h5>
          <p>
            You can view your public profile{" "}
            <Link to={`/tutor/${tutorId}`} className="tutor-profile__link">
              here
            </Link>
            .
            <br />
            If you need to make updates to your profile, please contact our team
            at{" "}
            <a
              href="mailto:tutorupdates@notely.com"
              className="tutor-profile__link"
            >
              tutorupdates@notely.com
            </a>
            .
            <br />
            All profile changes are reviewed and verified to maintain the
            quality and trust of the Notely platform.
          </p>
        </div>
      </div>
    </div>
  );
}
