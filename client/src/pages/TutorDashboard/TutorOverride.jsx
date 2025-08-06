import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerLocale } from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TutorOverride.css";

registerLocale("en-GB", enGB);

export default function TutorTimeOffPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [tutorId, setTutorId] = useState(null);

  useEffect(() => {
    const fetchTutorId = async () => {
      try {
        const res = await axios.get("http://localhost:3002/api/tutor/me", {
          withCredentials: true,
        });
        setTutorId(res.data.tutor_id);
      } catch (error) {
        console.error("Error fetching tutor ID:", error);
      }
    };
    fetchTutorId();
  }, []);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!tutorId) return;
      try {
        const response = await axios.get(
          "http://localhost:3002/api/booking/available-dates",
          {
            params: {
              tutor_id: tutorId,
              t: new Date().getTime(),
            },
            withCredentials: true,
          }
        );
        const dates = response.data.available_dates.map(
          (dateStr) => new Date(dateStr)
        );
        setHighlightedDates(dates);
      } catch (error) {
        console.error("Error fetching highlighted dates:", error);
      }
    };
    fetchAvailableDates();
  }, [tutorId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !tutorId) return;
      try {
        const response = await axios.get(
          "http://localhost:3002/api/booking/availability",
          {
            params: {
              tutor_id: tutorId,
              date: selectedDate.toLocaleDateString("en-CA"),
              t: new Date().getTime(),
            },
            withCredentials: true,
          }
        );

        const available = response.data.available_slots || [];
        const allTimes = [
          "07:00:00",
          "08:00:00",
          "09:00:00",
          "10:00:00",
          "11:00:00",
          "12:00:00",
          "13:00:00",
          "14:00:00",
          "15:00:00",
          "16:00:00",
          "17:00:00",
          "18:00:00",
          "19:00:00",
          "20:00:00",
          "21:00:00",
          "22:00:00",
        ];

        const filteredSlots = allTimes.filter((t) => available.includes(t));
        const slotList = filteredSlots.map((time) => ({
          time,
          blocked: false,
        }));

        setSlots(slotList);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };
    fetchSlots();
  }, [selectedDate, tutorId]);

  const toggleSlot = (clickedSlot) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.time === clickedSlot.time
          ? { ...slot, blocked: !slot.blocked }
          : slot
      )
    );
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:3002/api/tutor/timeoff/set",
        {
          date: selectedDate.toLocaleDateString("en-CA"),
          blockedSlots: slots.filter((s) => s.blocked).map((s) => s.time),
        },
        { withCredentials: true }
      );
      alert("Time off updated.");
      window.location.reload(); // Refresh after success
    } catch (error) {
      console.error("Error saving time off:", error);
      alert("Failed to save time off.");
    }
  };

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="tutor-timeoff__wrapper">
      <div className="tutor-timeoff__container py-0">
        <h2 className="tutor-timeoff__heading mb-4">Manage Time Off</h2>

        <div className="card p-4 mb-4">
          <div className="tutor-timeoff__calendar-card-inner">
            <h5 className="mb-3">Select a Date</h5>
            <DatePicker
              locale="en-GB"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              inline
              highlightDates={highlightedDates}
              dayClassName={(date) => {
                const isAvailable = highlightedDates.some(
                  (d) => d.toDateString() === date.toDateString()
                );
                const isSelected =
                  selectedDate &&
                  selectedDate.toDateString() === date.toDateString();
                if (isSelected) return "notely-selected-date";
                if (isAvailable) return "notely-available-date";
                return undefined;
              }}
            />
          </div>
        </div>

        {selectedDate && (
          <div className="card p-4 mb-4">
            <h5 className="mb-3">
              Adjust Availability for {selectedDate.toLocaleDateString("en-GB")}
            </h5>
            <div className="row">
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="time-slot-col mb-3 px-1 d-flex justify-content-center"
                >
                  <button
                    className={`btn w-100 tutor-timeoff__slot ${
                      slot.blocked ? "blocked" : "available"
                    }`}
                    onClick={() => toggleSlot(slot)}
                  >
                    {formatTime(slot.time)}
                  </button>
                </div>
              ))}
            </div>
            <div className="text-end">
              <button className="btn btn-notely-purple" onClick={handleSubmit}>
                Save Changes
              </button>
              <div className="text-end mt-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    // Clear overrides by submitting an empty list
                    axios
                      .post(
                        "http://localhost:3002/api/tutor/timeoff/set",
                        {
                          date: selectedDate.toLocaleDateString("en-CA"),
                          blockedSlots: [], // no overrides
                        },
                        { withCredentials: true }
                      )
                      .then(() => {
                        // Refresh everything
                        window.location.reload();
                      })
                      .catch((error) => {
                        console.error("Error resetting time off:", error);
                        alert("Failed to reset time off.");
                      });
                  }}
                >
                  Reset Usual Availability
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
