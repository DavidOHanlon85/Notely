import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import "./TutorMessages.css";

export default function TutorMessages() {
  const [messages, setMessages] = useState([]);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/api/tutor/messages",
          { withCredentials: true }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const columns = [
    {
      name: "Student",
      cell: (row) => (
        <a href={`/student/${row.student_id}`} className="tutor-messages__link">
          {row.student_first_name} {row.student_last_name}
        </a>
      ),
      sortable: true,
    },
    {
      name: "Last Message",
      selector: (row) => {
        const msg =
          row.last_message_text?.replace(/[\r\n]+/g, " ").trim() || "No message";
        return msg.length > 60 ? msg.slice(0, 60) + "..." : msg;
      },
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
        <div className="tutor-messages__action-wrapper">
          <button
            className="tutor-messages__badge tutor-messages__badge--purple"
            onClick={() => navigate(`/tutor/messages/${row.student_id}`)}
          >
            Message
          </button>
        </div>
      ),
    },
  ];

  const filteredMessages = messages.filter(
    (msg) =>
      msg.student_first_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      msg.student_last_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      msg.last_message_text?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="tutor-messages">
      <h2 className="tutor-messages__heading">Your Messages</h2>

      <div className="tutor-messages__search-wrapper">
        <input
          type="text"
          placeholder="Search messages..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="tutor-messages__search-input"
        />
      </div>

      <div className="tutor-messages__table-wrapper">
        <DataTable
          columns={columns}
          data={filteredMessages}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent={
            <div className="tutor-messages__no-messages">
              You have no messages yet.
            </div>
          }
        />
      </div>
    </div>
  );
}