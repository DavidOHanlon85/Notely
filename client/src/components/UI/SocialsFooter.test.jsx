import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./SocialsFooter";

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("SocialsFooter", () => {
  it("renders the Notely logo that links to home", () => {
    renderWithRouter(<Footer />);

    // The Link gets its accessible name from the img alt text
    const homeLink = screen.getByRole("link", { name: /notely logo/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");

    const img = screen.getByRole("img", { name: /notely logo/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("width", "175");
    expect(img).toHaveAttribute("height", "50");
  });

  it("renders Twitter, Instagram, and Facebook links with correct attributes", () => {
    const { container } = renderWithRouter(<Footer />);

    // Grab all links then pick by href (icons have no accessible text)
    const links = Array.from(container.querySelectorAll("a"));

    const twitter = links.find((a) => a.getAttribute("href")?.includes("twitter.com"));
    const instagram = links.find((a) => a.getAttribute("href")?.includes("instagram.com"));
    const facebook = links.find((a) => a.getAttribute("href")?.includes("facebook.com"));

    [twitter, instagram, facebook].forEach((a) => {
      expect(a).toBeTruthy();
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", expect.stringContaining("noopener"));
      expect(a).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    });

    // Icons exist
    expect(container.querySelector(".bi-twitter")).toBeInTheDocument();
    expect(container.querySelector(".bi-instagram")).toBeInTheDocument();
    expect(container.querySelector(".bi-facebook")).toBeInTheDocument();
  });
});