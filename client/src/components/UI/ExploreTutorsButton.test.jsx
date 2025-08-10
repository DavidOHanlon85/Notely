import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExploreTutorsButton from "./ExploreTutorsButton";

describe("ExploreTutorsButton", () => {
  const renderWithRouter = (ui) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders default large button with correct text and link", () => {
    renderWithRouter(<ExploreTutorsButton />);

    const link = screen.getByRole("link", { name: /Explore Our Tutors/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tutors");
    expect(link.className).toMatch(/btn-lg/);
    expect(link.className).toMatch(/btn-notely-gold/);

    // Icon exists
    const svg = link.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute("width")).toBe("30px");
  });

  it("applies correct class for sm size", () => {
    renderWithRouter(<ExploreTutorsButton size="sm" />);
    const link = screen.getByRole("link", { name: /Explore Our Tutors/i });
    expect(link.className).toMatch(/btn-sm/);
  });

  it("applies correct class for md size", () => {
    renderWithRouter(<ExploreTutorsButton size="md" />);
    const link = screen.getByRole("link", { name: /Explore Our Tutors/i });
    expect(link.className).toMatch(/btn-md/);
  });
});