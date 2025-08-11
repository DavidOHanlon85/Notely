// pages/PublicPages/TutorProfilePage.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";

// Spy-able navigate
const navSpy = vi.fn();

// Mock router + axios
vi.mock("react-router-dom", async (orig) => {
  const mod = await orig();
  return {
    ...mod,
    useParams: () => ({ id: "42" }),
    useNavigate: () => navSpy,
  };
});
vi.mock("axios", () => ({ default: { get: vi.fn() } }));

import axios from "axios";
import StaticProfilePage from "./TutorProfilePage";

describe("TutorProfilePage (lean)", () => {
  const mockTutor = {
    tutor_id: 42,
    tutor_first_name: "Alex",
    tutor_second_name: "Johnson",
    tutor_image: "/images/alex.jpg",
    tutor_price: 35,
    instruments: "Guitar, Piano",
    tutor_qualified: 1,
    tutor_sen: 0,
    tutor_dbs: 1,
    tutor_address_line_1: "12 Music St",
    tutor_city: "Belfast",
    tutor_postcode: "BT1 2AB",
    stats: {
      avg_rating: 4.6,
      review_count: 7,
      years_experience: 10,
      unique_students: 23,
    },
    availability: {
      Morning: [true, false, true, false, true, false, false],
      Afternoon: [false, true, false, true, false, false, false],
      "After School": [false, false, false, true, false, true, false],
      Evening: [true, true, false, false, false, false, true],
    },
    tutor_bio_paragraph_1: "I love teaching guitar and piano.",
    tutor_bio_paragraph_2: "Over 10 years of experience with students of all ages.",
    education: [{ degree: "BMus Music", institution: "QUB", year: "2015" }],
    certifications: [{ name: "ABRSM Grade 8 Guitar", year: "2012" }],
    feedback: [{ student_name: "Sam", feedback_text: "Great lessons!" }],
  };

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/tutor/42"]}>
        <Routes>
          <Route path="/tutor/:id" element={<StaticProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValueOnce({ data: mockTutor });
  });

  it("loads profile and shows key info + basic interactions", async () => {
    renderPage();

    // loading → name/price visible
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /alex johnson/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/£\s*35\/hr/i)).toBeInTheDocument();

    // a few obvious stats/badges
    expect(screen.getByText(/qualified teacher/i)).toBeInTheDocument();
    expect(screen.getByText(/dbs certified/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.6/i)).toBeInTheDocument();
    expect(screen.getByText(/7 reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/10\+ years teaching/i)).toBeInTheDocument();
    expect(screen.getByText(/23 Notely students/i)).toBeInTheDocument();

    // bio snippets render
    expect(
      screen.getByText(/love teaching guitar and piano/i)
    ).toBeInTheDocument();

    // education / certs render
    expect(screen.getByText(/BMus Music/i)).toBeInTheDocument();
    expect(screen.getByText(/ABRSM Grade 8 Guitar/i)).toBeInTheDocument();

    // availability table has headers and a tick somewhere
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(document.querySelectorAll(".notely-available-icon").length).toBeGreaterThan(0);

    // map iframe present
    expect(screen.getByTitle(/Tutor Location/i)).toBeInTheDocument();

    // CTAs navigate
    fireEvent.click(screen.getByRole("button", { name: /book now/i }));
    expect(navSpy).toHaveBeenCalledWith("/booking/42");

    fireEvent.click(screen.getByRole("button", { name: /message/i }));
    expect(navSpy).toHaveBeenCalledWith("/student/messages/42");
  });
});