import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./TutorProfile.css";

export default function TutorProfile() {
  const [tutorId, setTutorId] = useState(null);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [verificationFiles, setVerificationFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const location = useLocation();

  { /* Fetch Tutor Data */}

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tutor/me`, {
          withCredentials: true,
        });
        setTutorId(res.data.tutor_id);
        setStripeConnected(!!res.data.tutor_stripe_account_id);
      } catch (err) {
        console.error("Error fetching tutor data:", err);
      }
    };
    fetchTutorData();
  }, [location]);

  { /* Fetch Verification Files */}

  const fetchVerificationFiles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tutor/verification/files`,
        { withCredentials: true }
      );
      setVerificationFiles(res.data.files || []);
    } catch (err) {
      console.error("Error fetching verification files:", err);
    }
  };

  useEffect(() => {
    fetchVerificationFiles();
  }, []);

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3002/api/tutor/stripe/connect",
        {},
        { withCredentials: true }
      );
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Error connecting to Stripe:", err);
      alert("Could not initiate Stripe connection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpload = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData();

    if (form.dbs.files[0]) formData.append("dbs", form.dbs.files[0]);
    if (form.qualified.files[0])
      formData.append("qualified", form.qualified.files[0]);
    if (form.sen.files[0]) formData.append("sen", form.sen.files[0]);

    if (![...formData.keys()].length) {
      alert("Please choose at least one file to upload.");
      return;
    }

    try {
      setUploading(true);
      await axios.post(
        "http://localhost:3002/api/tutor/verification/upload",
        formData,
        { withCredentials: true }
      );
      form.reset();
      await fetchVerificationFiles();
      alert("Files uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Could not upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    const ok = window.confirm("Remove this file? This cannot be undone.");
    if (!ok) return;

    try {
      await axios.delete(
        `http://localhost:3002/api/tutor/verification/file/${encodeURIComponent(
          filename
        )}`,
        { withCredentials: true }
      );
      setVerificationFiles((prev) =>
        prev.filter((f) => (typeof f === "string" ? f.split("/").pop() : f.name) !== filename)
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete the file. Please try again.");
    }
  };

  return (
    <div className="tutor-profile-page">
      <div className="tutor-profile__wrapper">
        <div className="tutor-profile__container py-0">
          <h2 className="tutor-profile__heading mb-4">My Profile</h2>

          {/* Stripe Connection Box */}
          <div className="card p-4 mb-4">
            <h5 className="mb-3">Connect to Stripe</h5>
            <p>
              Stripe is a{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noreferrer"
                className="tutor-profile__link"
              >
                3rd Party Payment Platform
              </a>{" "}
              used to process payments on Notely. Connecting your account
              ensures you can be paid securely for each lesson.
            </p>
            <button
              className={
                stripeConnected
                  ? "tutor-profile__stripe-connected"
                  : "btn btn-notely-purple"
              }
              onClick={handleConnectStripe}
              disabled={stripeConnected || loading}
            >
              {stripeConnected ? (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Stripe Connected
                </>
              ) : loading ? (
                "Connecting..."
              ) : (
                "Connect to Stripe"
              )}
            </button>
          </div>

          {/* Profile Update Box */}
          <div className="card p-4 mb-4">
            <h5 className="mb-3">Update Your Profile</h5>
            <p>
              You can view your public profile{" "}
              <Link to={`/tutor/${tutorId}`} className="tutor-profile__link">
                here
              </Link>
              .
              <br />
              If you need to make updates to your profile, please contact our
              team at{" "}
              <a
                href="mailto:tutorupdates@notely.com"
                className="tutor-profile__link"
              >
                tutorupdates@notely.com
              </a>
              .
              <br />
              All profile changes are reviewed and verified to maintain the
              quality and trust of the Notely platform.
            </p>
          </div>

          {/* Verification Upload Box */}
          <div className="card p-4 mb-4 tutor-profile__verification-card">
            <h5 className="mb-3">Upload Verification Files</h5>
            <p className="mb-3">
              If you have selected <strong>Yes</strong> for{" "}
              <strong>DBS Checked</strong>, <strong>Qualified Teacher</strong>,
              or <strong>SEN Experience</strong>, please upload supporting
              evidence here. Accepted file types: PDF, JPG, PNG.
            </p>

            <form onSubmit={handleVerificationUpload}>
              <div className="mb-3">
                <label className="form-label">DBS Check</label>
                <input
                  type="file"
                  name="dbs"
                  className="form-control tutor-profile__file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Qualified Teacher Evidence</label>
                <input
                  type="file"
                  name="qualified"
                  className="form-control tutor-profile__file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">SEN Experience Evidence</label>
                <input
                  type="file"
                  name="sen"
                  className="form-control tutor-profile__file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <button
                type="submit"
                className="btn btn-notely-purple"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            <div className="mt-4">
              <h6 className="mb-2">Uploaded Files</h6>
              {!verificationFiles || verificationFiles.length === 0 ? (
                <p className="text-muted mb-0">
                  No verification files uploaded yet.
                </p>
              ) : (
                <ul className="tutor-profile__file-list">
                  {verificationFiles.map((file, idx) => {
                    // handle string or object
                    const isString = typeof file === "string";
                    const rawUrl =
                      isString ? file : file.url || file.path || file.filepath || "";
                    const href = rawUrl?.startsWith("http")
                      ? rawUrl
                      : `http://localhost:3002${
                          rawUrl?.startsWith("/") ? "" : "/"
                        }${rawUrl || ""}`;
                    const name =
                      (isString && file.split("/").pop()) ||
                      file.filename ||
                      file.name ||
                      (rawUrl ? rawUrl.split("/").pop() : `file-${idx}`);
                    const badge = file.field || file.fieldname || file.category;

                    return (
                      <li key={idx} className="tutor-profile__file-row">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-text text-muted"></i>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="tutor-profile__link"
                            title={name}
                          >
                            {name}
                          </a>
                          {badge && (
                            <span className="badge bg-secondary ms-1">{badge}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="tutor-profile__btn-outline btn-sm"
                          onClick={() => handleDeleteFile(name)}
                          title="Remove file"
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}