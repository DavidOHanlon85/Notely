import React from "react";
import "./TutorRegister.css";

export default function TutorRegisterStep7({ formData, onBack, onSubmit, submissionError }) {
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      {submissionError && (
        <div className="alert alert-danger text-center" role="alert">
          {submissionError}
        </div>
      )}

      <form
        onSubmit={handleFinalSubmit}
        className="w-100"
        style={{ maxWidth: "600px" }}
      >
        <h2 className="mb-4">Review & Confirm</h2>

        {/* Account Info */}
        <section className="mb-4">
          <h3 className="text-purple">Account Info</h3>
          <p className="mb-1">
            <strong>Email:</strong> {formData.tutor_email}
          </p>
          <p className="mb-1">
            <strong>Username:</strong> {formData.tutor_username}
          </p>
          <p className="mb-1">
            <strong>Phone:</strong> {formData.tutor_phone}
          </p>
        </section>

        {/* Address */}
        <section className="mb-4">
          <h3 className="text-purple">Address</h3>
          <p>
            {formData.tutor_address_line_1}, {formData.tutor_postcode}
          </p>
        </section>

        {/* About */}
        <section className="mb-4">
          <h3 className="text-purple">About You</h3>
          <p>
            <strong>Tagline:</strong> {formData.tutor_tagline}
          </p>
          <p>{formData.tutor_bio_paragraph_1}</p>
          {formData.tutor_bio_paragraph_2 && (
            <p>{formData.tutor_bio_paragraph_2}</p>
          )}
        </section>

        {/* Teaching Details */}
        <section className="mb-4">
          <h3 className="text-purple">Teaching Details</h3>
          <p className="mb-1">
            <strong>Instruments:</strong>{" "}
            {formData.tutor_instruments?.join(", ")}
          </p>
          <p className="mb-1">
            <strong>Start Date:</strong> {formData.tutor_teaching_start_date}
          </p>
          <p className="mb-1">
            <strong>Price:</strong> £{formData.tutor_price}/hour
          </p>
        </section>

        {/* Education */}
        <section className="mb-4">
          <h3 className="text-purple">Education</h3>
          {formData.education?.length > 0 ? (
            formData.education.map((edu, idx) => (
              <p key={idx} className="mb-1">
                <strong>{edu.qualification}</strong> ({edu.year}) –{" "}
                {edu.institution}
              </p>
            ))
          ) : (
            <p>No education entries provided.</p>
          )}
        </section>

        {/* Certifications */}
        {formData.certifications?.length > 0 && (
          <section className="mb-4">
            <h3 className="text-purple">Certifications</h3>
            {formData.certifications.map((cert, idx) => (
              <p key={idx} className="mb-1">
                {cert.certification} ({cert.year})
              </p>
            ))}
          </section>
        )}

        {/* Availability */}
        <section className="mb-4">
          <h3 className="text-purple">Availability</h3>
          <div className="table-responsive">
            <table className="table text-center align-middle availability-table">
              <thead>
                <tr>
                  <th></th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <th key={day}>{day}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {["Morning", "Afternoon", "After School", "Evening"].map(
                  (slot) => (
                    <tr key={slot}>
                      <td className="text-start fw-medium">{slot}</td>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => {
                          const isAvailable = formData.availability?.some(
                            (entry) =>
                              entry.day_of_week === day &&
                              entry.time_slot === slot &&
                              entry.is_available
                          );
                          return (
                            <td key={`${day}-${slot}`}>
                              {isAvailable && (
                                <span className="notely-available-icon" />
                              )}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-notely-purple d-inline-flex align-items-center"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left-circle-fill me-2"></i> Back
          </button>
          <button
            type="submit"
            className="btn btn-notely-purple d-inline-flex align-items-center gap-2"
          >
            Confirm & Submit <i className="bi bi-check-circle-fill"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
