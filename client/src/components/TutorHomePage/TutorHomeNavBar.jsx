import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./TutorHomeNavBar.css";

export default function TutorHomeNavBar() {
  const [userRole, setUserRole] = useState(null); // 'student' | 'tutor' | 'admin' | null
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      try {
        const s = await axios.get("http://localhost:3002/api/student/me", { withCredentials: true });
        if (isMounted && s.data?.student_id) return setUserRole("student");
      } catch {}

      try {
        const t = await axios.get("http://localhost:3002/api/tutor/me", { withCredentials: true });
        if (isMounted && t.data?.tutor_id) return setUserRole("tutor");
      } catch {}

      try {
        const a = await axios.get("http://localhost:3002/api/admin/me", { withCredentials: true });
        if (isMounted && a.data?.admin_id) return setUserRole("admin");
      } catch {}

      if (isMounted) setUserRole(null);
    };

    fetchRole();
    return () => { isMounted = false; };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (userRole === "student") {
        await axios.post("http://localhost:3002/api/student/logout", {}, { withCredentials: true });
      } else if (userRole === "tutor") {
        await axios.post("http://localhost:3002/api/tutor/logout", {}, { withCredentials: true });
      } else if (userRole === "admin") {
        await axios.post("http://localhost:3002/api/admin/logout", {}, { withCredentials: true });
      }
      setUserRole(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="tutor-home tutor-home-nav-wrapper">
      <div className="container">
        <header className="d-flex flex-wrap align-items-center justify-content-between py-3 tutor-home-border-bottom">
          <div className="col-12 col-md-3 mb-2 mb-md-0 text-center text-md-start">
            <Link to="/">
              <img
                src={NotelyRectangle}
                alt="Notely Logo"
                width="175"
                height="50"
              />
            </Link>
          </div>

          <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end gap-2">
            {userRole ? (
              <>
                <Link
                  to={`/${userRole}/dashboard`}
                  className="tutor-home-btn-outline me-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="tutor-home-btn-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* As per your reference header: Home + Tutors */}
                <Link to="/tutor/login" className="tutor-home-btn-outline me-2">
                  Login
                </Link>
                <Link to="/tutor/register" className="tutor-home-btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </header>
      </div>
    </div>
  );
}