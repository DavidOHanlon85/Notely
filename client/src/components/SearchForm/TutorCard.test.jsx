import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TutorCard from "./TutorCard";

// Helper: minimal render with router
const renderWithRouter = (ui) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

const baseTutor = {
  tutor_id: 9,
  tutor_first_name: "Sarah",
  tutor_second_name: "Palmer",
  tutor_image: "/uploads/sarah.jpg",
  tutor_city: "Belfast",
  instruments: "Piano, Guitar",
  tutor_tag_line: "Bringing music to life.",
  avg_rating: 4.8,
  review_count: 27,
  years_experience: 8,
  tutor_sen: 1,
  tutor_qualified: 1,
  tutor_dbs: 1,
  tutor_modality: "Online",
  tutor_price: 45,
};

describe("TutorCard", () => {
  it("renders name as a link to the tutor profile and shows city", () => {
    renderWithRouter(<TutorCard tutor={baseTutor} />);

    const nameLink = screen.getByRole("link", { name: /sarah palmer/i });
    expect(nameLink).toBeInTheDocument();
    expect(nameLink).toHaveAttribute("href", "/tutor/9");

    expect(screen.getByText(/Belfast/i)).toBeInTheDocument();
  });

  it("renders instruments as badges when provided", () => {
    renderWithRouter(<TutorCard tutor={baseTutor} />);

    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("Guitar")).toBeInTheDocument();
  });

  it("renders tagline in quotes", () => {
    renderWithRouter(<TutorCard tutor={baseTutor} />);

    expect(screen.getByText(/“Bringing music to life\.”/i)).toBeInTheDocument();
  });

  it("renders stats badge with rating, review count and experience", () => {
    renderWithRouter(<TutorCard tutor={baseTutor} />);

    // Rating and reviews
    expect(screen.getByText(/4\.8/i)).toBeInTheDocument();
    expect(screen.getByText(/\(27 reviews\)/i)).toBeInTheDocument();

    // Experience text
    expect(screen.getByText(/8\+ yrs experience/i)).toBeInTheDocument();
  });

  it("shows conditional qualification badges and modality", () => {
    renderWithRouter(<TutorCard tutor={baseTutor} />);

    expect(screen.getByText(/SEN Trained/i)).toBeInTheDocument();
    expect(screen.getByText(/Qualified Teacher/i)).toBeInTheDocument();
    expect(screen.getByText(/DBS Certified/i)).toBeInTheDocument();
    expect(screen.getByText(/Online/i)).toBeInTheDocument();
  });

  it("renders price correctly and booking button links to /booking/:id", () => {
    renderWithRouter(<TutorCard tutor={baseTutor} />);

    expect(screen.getByText(/£45\/hr/i)).toBeInTheDocument();

    const bookNow = screen.getByRole("button", { name: /book now/i });
    expect(bookNow).toBeInTheDocument();
    // Button lives inside a Link; assert the wrapping link has correct href
    const bookingLink = bookNow.closest("a");
    expect(bookingLink).toHaveAttribute("href", "/booking/9");
  });

  it("handles missing instruments gracefully", () => {
    const tutorNoInstruments = { ...baseTutor, instruments: "" };
    renderWithRouter(<TutorCard tutor={tutorNoInstruments} />);

    // Should still render, but no instrument badges found
    expect(screen.getByRole("link", { name: /sarah palmer/i })).toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();
    expect(screen.queryByText("Guitar")).not.toBeInTheDocument();
  });

  it("falls back to em dash for invalid price", () => {
    const tutorNoPrice = { ...baseTutor, tutor_price: NaN };
    renderWithRouter(<TutorCard tutor={tutorNoPrice} />);

    expect(screen.getByText(/£—\/hr/i)).toBeInTheDocument();
  });
});