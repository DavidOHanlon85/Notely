import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DoubleNavBar from "../../components/UI/DoubleButtonNavBar";
import "./MessagePage.css";

export default function MessagePage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = useNavigate();

  // Bottom scrolling in chat

  const bottomRef = useRef(null);

  {/* Redirect if not a student */}

  useEffect(() => {
    const checkStudent = async () => {
      try {
        await axios.get("http://localhost:3002/api/student/me", {
          withCredentials: true,
        });
        setAuthChecked(true);
      } catch {
        const next = encodeURIComponent(location.pathname + location.search);
        navigate(`/student/login?next=${next}`, { replace: true });
      }
    };
    checkStudent();
  }, [navigate, location.pathname, location.search]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

   useEffect(() => {
    if (!authChecked) return;
    const fetchTutorAndMessages = async () => {
      try {
        const [tutorRes, messagesRes] = await Promise.all([
          axios.get(`http://localhost:3002/api/tutor/${tutorId}`),
          axios.get(`http://localhost:3002/api/messages/${tutorId}`, {
            withCredentials: true,
          }),
        ]);
        setTutor(tutorRes.data);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error(
          "Error fetching tutor or messages:",
          err.response?.data || err.message
        );
      }
    };
    fetchTutorAndMessages();
  }, [tutorId, authChecked]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      console.log({
        tutor_id: tutorId,
        message_text: newMessage,
        sender_role: "student",
      });
      const res = await axios.post(
        "http://localhost:3002/api/messages/send",
        {
          tutor_id: tutorId,
          message_text: newMessage,
          sender_role: "student",
        },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error(
        "Error sending message:",
        err.response?.data || err.message
      );
    } finally {
      setSending(false);
    }
  };

  if (!tutor) return <div className="text-center mt-5">Loading...</div>;

  const fullName = `${tutor.tutor_first_name} ${tutor.tutor_second_name}`;
  const instruments = tutor.instruments ? tutor.instruments.split(", ") : [];

  return (
    <div className="message-page">
      <DoubleNavBar />
      <div className="container mt-4 col-md-12 col-lg-6">
        {/* Tutor Card */}
        <div className="card p-4 tutor-profile-card mb-3">
          <div className="row">
            <div className="col-md-4 text-center">
              <div className="tutor-profile-photo mx-auto mb-4">
                <img
                  src={`http://localhost:3002${tutor.tutor_image}`}
                  alt={fullName}
                  className="img-fluid rounded-circle border border-warning"
                  style={{
                    width: "220px",
                    height: "220px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <h4 className="fw-bold mt-2">£{tutor.tutor_price}/hr</h4>
            </div>

            <div className="col-md-8 d-flex flex-column justify-content-between">
              <div>
                <h1
                  className="h3 text-md-start text-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/tutor/${tutor.tutor_id}`)}
                >
                  {fullName}
                </h1>
                {instruments.map((inst, index) => (
                  <span key={index} className="badge bg-secondary mb-2 me-1">
                    {inst}
                  </span>
                ))}
                <div className="mb-2">
                  {tutor.tutor_qualified === 1 && (
                    <span className="badge bg-warning text-dark me-1">
                      Qualified Teacher
                    </span>
                  )}
                  {tutor.tutor_sen === 1 && (
                    <span className="badge bg-warning text-dark me-1">
                      SEN Trained
                    </span>
                  )}
                  {tutor.tutor_dbs === 1 && (
                    <span className="badge bg-warning text-dark">
                      DBS Certified
                    </span>
                  )}
                </div>
                <ul className="list-unstyled mb-3">
                  <li
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/feedback/${tutor.tutor_id}`)}
                  >
                    <i className="bi bi-star-fill svg-icon"></i>
                    <strong> {tutor.stats?.avg_rating || "N/A"}</strong> (
                    {tutor.stats?.review_count || 0} reviews)
                  </li>
                  <li>
                    <i className="bi bi-clock-fill svg-icon"></i>{" "}
                    {tutor.stats?.years_experience || 0}+ years teaching
                    experience
                  </li>
                  <li>
                    <i className="bi bi-person-circle svg-icon"></i>{" "}
                    {tutor.stats?.unique_students || 0} Notely students
                  </li>
                </ul>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-notely-gold fw-bold"
                  onClick={() => navigate(`/booking/${tutor.tutor_id}`)}
                >
                  Book Now
                </button>
                <button
                  className="btn btn-notely-outline-gold"
                  onClick={() =>
                    navigate(`/student/messages/${tutor.tutor_id}`)
                  }
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Box */}
        <div className="chat-container card p-4">
          <h5 className="mb-3">Conversation</h5>
          <div className="chat-messages mb-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${
                  msg.sender_role === "student" ? "student" : "tutor"
                }`}
              >
                {msg.message_text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
            />
            <button
              className="btn btn-notely-gold"
              onClick={handleSend}
              disabled={sending}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
