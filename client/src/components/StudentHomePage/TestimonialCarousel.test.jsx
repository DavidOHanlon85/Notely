import React from "react";
import { render, screen, within } from "@testing-library/react";
import TestimonialCarousel from "./TestimonialCarousel";

describe("TestimonialCarousel", () => {
  it("renders the section heading and divider", () => {
    render(<TestimonialCarousel />);
    expect(
      screen.getByRole("heading", { name: /what our users say/i })
    ).toBeInTheDocument();

    // There is one <hr> immediately under the heading
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders the correct number of indicators and slides", () => {
    render(<TestimonialCarousel />);
  
    // Indicators are buttons with aria-label "Slide N"
    const indicators = screen.getAllByRole("button", { name: /slide \d+/i });
    expect(indicators).toHaveLength(5);
  
    // Bootstrap markup: query the element by class
    const carouselInner = document.querySelector(".carousel-inner");
    expect(carouselInner).toBeTruthy();
  
    const slides = carouselInner.querySelectorAll(".carousel-item");
    expect(slides.length).toBe(5);
  });

  it("marks the first slide as active and others not active", () => {
    render(<TestimonialCarousel />);
    const carouselInner = document.querySelector(".carousel-inner");
    const items = Array.from(carouselInner.querySelectorAll(".carousel-item"));
    expect(items[0].className).toMatch(/\bactive\b/);
    items.slice(1).forEach((el) => {
      expect(el.className).not.toMatch(/\bactive\b/);
    });
  });

  it("renders testimonial images with correct alt text", () => {
    render(<TestimonialCarousel />);

    // Names used as alt text in the component
    const names = ["Laura H.", "Chloe M.", "David R.", "Aidan S.", "Meera T."];
    names.forEach((name) => {
      const img = screen.getByAltText(name);
      expect(img).toBeInTheDocument();
      expect(img.tagName.toLowerCase()).toBe("img");
      expect(img.getAttribute("src")).toMatch(/\/assets\/images\/TestimonialImages\/.+\.jpg$/);
    });
  });

  it("renders previous and next controls", () => {
    render(<TestimonialCarousel />);
    // Controls include visually hidden text labels
    expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });
});