import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./StudentMessages.css";

export default function StudentMessages() {
  const [messages, setMessages] = useState([]);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  { /* Fetch Messages */ }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/student/messages`,
          {
            withCredentials: true,
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  { /* Table Design */ }

  const columns = [
    {
      name: "Tutor",
      cell: (row) => (
        <a href={`/tutor/${row.tutor_id}`} className="tutor-link">
          {row.tutor_first_name} {row.tutor_second_name}
        </a>
      ),
      sortable: true,
    },
    {
      name: "Last Message",
      selector: (row) => {
        const msg =
          row.last_message_text?.replace(/[\r\n]+/g, " ").trim() ||
          "No message";
        return msg.length > 60 ? msg.slice(0, 60) + "..." : msg;
      },
      sortable: false,
    },
    {
      name: "Date/Time",
      selector: (row) =>
        row.last_message_time
          ? new Date(row.last_message_time).toLocaleString("en-GB", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            className={`badge badge-gold clickable message-clean`}
            onClick={() => navigate(`/student/messages/${row.tutor_id}`)}
          >
            Message
          </button>
          {row.message_read === 0 && (
            <span className="badge badge-black unread-label">Unread</span>
          )}
        </div>
      ),
    },
  ];

  const filteredMessages = messages.filter(
    (msg) =>
      msg.tutor_first_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      msg.tutor_second_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      msg.last_message_text?.toLowerCase().includes(filterText.toLowerCase())
  );

  console.log(messages);

  return (
    <div className="student-messages">
      <h2 className="messages-heading">Your Messages</h2>

      <div className="messages-search-wrapper">
        <input
          type="text"
          placeholder="Search messages..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-scroll-wrapper">
        <DataTable
          columns={columns}
          data={filteredMessages}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="no-messages-message">You have no messages yet.</div>
          }
        />
      </div>
    </div>
  );
}
