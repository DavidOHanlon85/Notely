import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotelyRectangle from "../../assets/images/NotelyRectangle.png";
import "./DoubleButtonNavBar.css";
import axios from "axios";

export default function DoubleButtonNavBar() {
  const [userRole, setUserRole] = useState(null); // 'student' | 'tutor' | 'admin' | null
  const navigate = useNavigate();

  {/* Role authentication for personalisation */}

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const studentRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/me`, {
          withCredentials: true,
        });
        if (studentRes.data?.student_id) {
          setUserRole("student");
          return;
        }
      } catch {}

      try {
        const tutorRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/tutor/me`, {
          withCredentials: true,
        });
        if (tutorRes.data?.tutor_id) {
          setUserRole("tutor");
          return;
        }
      } catch {}

      try {
        const adminRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/me`, {
          withCredentials: true,
        });
        if (adminRes.data?.admin_id) {
          setUserRole("admin");
          return;
        }
      } catch {}

      setUserRole(null); // Not logged in
    };

    fetchRole();
  }, []);

  {/* Handle Logouts */ }
  
  const handleLogout = async () => {
    try {
      if (userRole === "student") {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/student/logout`, {}, { withCredentials: true });
      } else if (userRole === "tutor") {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/tutor/logout`, {}, { withCredentials: true });
      } else if (userRole === "admin") {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/logout`, {}, { withCredentials: true });
      }

      setUserRole(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div>
      <div className="container">
        <header className="d-flex flex-wrap align-items-center justify-content-between py-4 mb-4 border-bottom">
          <div className="col-12 col-md-3 mb-2 mb-md-0 text-center text-md-start">
            <img
              src={NotelyRectangle}
              alt="Notely Logo"
              width="175"
              height="50"
            />
          </div>

          <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end gap-2">
            {userRole ? (
              <>
                <Link
                  to={`/${userRole}/dashboard`}
                  className="btn btn-notely-outline me-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-notely-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/student/login" className="btn btn-notely-outline me-2">
                  Login
                </Link>
                <Link to="/student/register" className="btn btn-notely-primary">
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