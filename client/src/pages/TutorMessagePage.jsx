import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DoubleNavBar from "../components/UI/DoubleButtonNavBar";
import SocialsFooter from "../components/UI/SocialsFooter";
import axios from "axios";
import studentSilhouette from "../assets/images/Messaging/StudentPlaceholder.jpg";
import "./TutorMessagePage.css";

export default function TutorMessagePage() {
  const { student_id } = useParams();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchStudentAndMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3002/api/tutor/messages/${student_id}`,
          { withCredentials: true }
        );
  
        setStudent(res.data.student);
        setStats(res.data.stats);
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Error fetching student messages or profile:", err);
      }
    };
  
    fetchStudentAndMessages();
  }, [student_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
  
    try {
      const res = await axios.post(
        "http://localhost:3002/api/tutor/messages/send",
        {
          student_id: student.student_id,
          message_text: newMessage,
        },
        { withCredentials: true }
      );
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!student) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="tutor-message-page d-flex flex-column min-vh-100">
      <DoubleNavBar />

      <main className="flex-fill container mt-4 col-md-12 col-lg-6">
        {/* Student Info Card */}
        <div className="card p-4 tutor-message__student-card mb-4">
          <div className="row">
            <div className="col-md-4 text-center">
              <div className="tutor-message__student-photo mx-auto mb-4">
                <img
                  src={studentSilhouette}
                  alt="Student"
                  className="img-fluid rounded-circle"
                  style={{ width: "220px", height: "220px", objectFit: "cover" }}
                />
              </div>
            </div>

            <div className="col-md-8 d-flex flex-column justify-content-center">
              <h1 className="h2 text-md-start text-center mb-3">
                {student.student_first_name} {student.student_last_name}
              </h1>
              <ul className="list-unstyled mb-0">
                <li>
                  <i className="bi bi-star-fill svg-icon"></i>
                  <strong> {stats.avg_rating || "N/A"}</strong>{" "}
                  ({stats.review_count || 0} reviews)
                </li>
                <li>
                  <i className="bi bi-person-circle svg-icon"></i>{" "}
                  <strong>{stats.total_lessons || 0}</strong> Notely Lessons
                </li>
                <li>
                  <i className="bi bi-calendar-check-fill svg-icon"></i>{" "}
                  Member since <strong>{stats.member_since || "N/A"}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Conversation Box */}
        <div className="card p-4 tutor-message__chat-container mb-4">
          <h5 className="mb-3">Conversation</h5>
          <div className="tutor-message__chat-messages mb-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`tutor-message__chat-bubble ${
                  msg.sender_role === "tutor" ? "tutor" : "student"
                }`}
              >
                {msg.message_text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="d-flex tutor-message__chat-input">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="btn btn-notely-purple" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </main>

      <SocialsFooter />
    </div>
  );
}