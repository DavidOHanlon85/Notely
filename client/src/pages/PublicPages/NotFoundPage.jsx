import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoubleButtonNavBar from "../../components/UI/DoubleButtonNavBar";
import SocialsFooter from "../../components/UI/SocialsFooter";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./NotFoundPage.css";
import axios from "axios";

export default function NotFoundPage() {
  const [role, setRole] = useState(null); // 'student' | 'tutor' | 'admin' | null

  { /* Detect role for personalisation */ }

  useEffect(() => {
    let mounted = true;

    const detectRole = async () => {
      try {
        const s = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/me`, { withCredentials: true });
        if (mounted && s.data?.student_id) return setRole("student");
      } catch {}

      try {
        const t = await axios.get(`${import.meta.env.VITE_API_URL}/api/tutor/me`, { withCredentials: true });
        if (mounted && t.data?.tutor_id) return setRole("tutor");
      } catch {}

      try {
        const a = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/me`, { withCredentials: true });
        if (mounted && a.data?.admin_id) return setRole("admin");
      } catch {}

      if (mounted) setRole(null);
    };

    detectRole();
    return () => { mounted = false; };
  }, []);

  const primaryCta = role
    ? { to: `/${role}/dashboard`, label: "Go to Dashboard" }
    : { to: "/tutors", label: "Find a Tutor" };

  const secondaryCta = role
    ? { to: "/", label: "Back to Home" }
    : { to: "/student/login", label: "Login" };

  return (
    <div className="d-flex flex-column min-vh-100 notfound-wrap">
      <DoubleButtonNavBar />

      <main className="flex-fill d-flex align-items-center justify-content-center">
        <div className="container px-4 py-5 text-center">
          <img
            className="d-block mx-auto mb-4 notely-rectangle"
            src={NotelyRectangle}
            alt="Notely Logo"
            width="260"
            height="75"
          />

          <h1 className="display-4 text-body-emphasis mt-2">404 — Page Not Found</h1>
          <h2 className="fs-4 text-body-emphasis mb-3">Looks like we hit a flat note.</h2>

          <div className="mx-auto mb-4 notfound-copy">
            <p className="lead">
              The page you’re looking for doesn’t exist or you don’t have access.
              Let’s get you back on the right track.
            </p>
          </div>

          <div className="row justify-content-center gy-2 gx-3">
            <div className="col-12 col-sm-auto">
              <Link
                to={primaryCta.to}
                className="btn btn-notely-gold w-100 d-inline-flex justify-content-center align-items-center gap-2"
              >
                <span>{primaryCta.label}</span>
                
              </Link>
            </div>

            <div className="col-12 col-sm-auto">
              <Link
                to={secondaryCta.to}
                className="btn btn-notely-outline-light w-100 d-inline-flex justify-content-center align-items-center gap-2"
              >
                <span><strong>{secondaryCta.label}</strong></span>
      
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-muted">If this keeps happening, please contact support.</p>
          </div>
        </div>
      </main>

      <SocialsFooter />
    </div>
  );
}