import { render, screen } from "@testing-library/react";
import React from "react";
import SearchHero from "./SearchHero";

describe("SearchHero", () => {
  it("renders the Notely logo with correct alt text", () => {
    render(<SearchHero />);
    const logo = screen.getByAltText(/Notely Logo/i);
    expect(logo).toBeInTheDocument();
    // keeps it generic so we don't depend on bundler URL transforms
    expect(logo).toHaveAttribute("width", "240");
  });

  it("shows the primary heading", () => {
    render(<SearchHero />);
    expect(
      screen.getByRole("heading", { name: /Find Your Music Tutor/i })
    ).toBeInTheDocument();
  });

  it("shows the supporting copy", () => {
    render(<SearchHero />);
    expect(
      screen.getByText(/Learn at your pace, your style/i)
    ).toBeInTheDocument();
  });

  it("wraps content in a search-hero section", () => {
    const { container } = render(<SearchHero />);
    const section = container.querySelector("section.search-hero");
    expect(section).toBeTruthy();
  });
});