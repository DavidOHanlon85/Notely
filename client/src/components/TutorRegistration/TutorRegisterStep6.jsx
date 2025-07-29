import React, { useState, useEffect } from "react";
import "./TutorRegister.css";

export default function TutorRegisterStep6({ formData, setFormData, onNext, onBack }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["Morning", "Afternoon", "After School", "Evening"];

  // Restore availability from formData if present
  const initialAvailability = () => {
    const saved = formData.availability || [];
    const parsed = {};
    saved.forEach(({ day_of_week, time_slot }) => {
      if (!parsed[day_of_week]) parsed[day_of_week] = [];
      parsed[day_of_week].push(time_slot);
    });
    return parsed;
  };

  const [availability, setAvailability] = useState(initialAvailability);
  const [formErrors, setFormErrors] = useState({});

  const toggleSlot = (day, slot) => {
    setAvailability((prev) => {
      const current = prev[day] || [];
      const updated = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selected = Object.values(availability).flat();
    if (selected.length === 0) {
      setFormErrors({
        availability: "Please select at least one availability slot.",
      });
      return;
    }

    const formatted = [];
    for (const [day, slots] of Object.entries(availability)) {
      slots.forEach((slot) => {
        formatted.push({
          day_of_week: day,
          time_slot: slot,
          is_available: 1,
        });
      });
    }

    setFormData((prev) => ({
      ...prev,
      availability: formatted,
    }));

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: "700px" }}>
      <div className="card p-4 mt-4">
        <h2 className="h5 mb-3">Availability</h2>
        {formErrors.availability && (
          <div className="text-danger mb-3">{formErrors.availability}</div>
        )}

        <div className="table-responsive">
          <table className="table text-center align-middle availability-table">
            <thead>
              <tr>
                <th></th>
                {days.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot}>
                  <td className="text-start fw-medium">{slot}</td>
                  {days.map((day) => {
                    const selected = availability[day]?.includes(slot);
                    return (
                      <td
                        key={`${day}-${slot}`}
                        onClick={() => toggleSlot(day, slot)}
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          className={`notely-available-icon ${
                            selected ? "selected" : "unselected"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe Connect Placeholder */}
      <div className="card p-4 mt-4">
        <h2 className="h5 mb-3">Stripe Setup</h2>
        <p>To receive payments through Notely, you'll need to connect a Stripe account.</p>
        <button
          type="button"
          className="btn btn-notely-purple"
          disabled
          title="Stripe setup coming soon"
        >
          Connect with Stripe (Coming Soon)
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-notely-purple d-inline-flex align-items-center"
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i> Back
        </button>
        <button
          type="submit"
          className="btn btn-notely-purple d-inline-flex align-items-center gap-2"
        >
          Finish <i className="bi bi-check-circle-fill"></i>
        </button>
      </div>
    </form>
  );
}