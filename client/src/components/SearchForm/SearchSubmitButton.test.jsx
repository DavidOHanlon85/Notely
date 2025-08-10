import React from "react";
import { render, screen } from "@testing-library/react";
import SearchSubmitButton from "./SearchSubmitButton";

describe("SearchSubmitButton", () => {
  it("renders the submit button with correct text", () => {
    render(<SearchSubmitButton />);
    const button = screen.getByRole("button", { name: /find your music tutor/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "submit");
  });

  it("has the correct CSS classes for styling", () => {
    render(<SearchSubmitButton />);
    const button = screen.getByRole("button", { name: /find your music tutor/i });
    expect(button).toHaveClass("btn", "btn-notely-primary", "btn-notely-cta");
  });
});