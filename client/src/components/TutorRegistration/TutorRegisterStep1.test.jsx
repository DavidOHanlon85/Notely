import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep1 from "./TutorRegisterStep1";

describe("TutorRegisterStep1", () => {
  // I’m using minimal base props and overriding per test where needed
  const setup = (overrides = {}) => {
    const setFormData = vi.fn();
    const onNext = vi.fn();
    const formData = {
      tutor_first_name: "",
      tutor_second_name: "",
      tutor_username: "",
      tutor_email: "",
      tutor_phone: "",
      tutor_password: "",
      confirmPassword: "",
      ...overrides.formData,
    };

    render(
      <TutorRegisterStep1
        formData={formData}
        setFormData={setFormData}
        onNext={onNext}
      />
    );

    return { setFormData, onNext };
  };

  // I’m asserting all expected inputs are present via their placeholders
  it("renders all expected fields", () => {
    setup();
  
    // text inputs
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument();
  
    // passwords (exact placeholder match to avoid duplicate matches)
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
  
    // submit
    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
  });

  // I’m checking we call setFormData (the component uses functional updates so I just assert it’s called)
  it("calls setFormData when any field changes", () => {
    const { setFormData } = setup();

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { name: "tutor_first_name", value: "Jane" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), {
      target: { name: "tutor_second_name", value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { name: "tutor_username", value: "janedoe" },
    });

    // We don’t assert the exact payload because the component passes a function(prev) => ...
    expect(setFormData).toHaveBeenCalledTimes(3);
    expect(typeof setFormData.mock.calls[0][0]).toBe("function");
  });

  // I’m verifying validation errors appear for empty required fields
  it("shows validation errors when submitting empty form", () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(
      screen.getByText(/First name is required\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Last name is required\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Username is required\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Valid email is required\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Valid phone number required\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Password must be at least 8 characters\./i)
    ).toBeInTheDocument();
    // Passwords do not match is also expected because both are empty vs empty? -> The code compares strings; empty === empty so no mismatch here.
    expect(
      screen.queryByText(/Passwords do not match\./i)
    ).not.toBeInTheDocument();
  });

  // I’m checking phone validation: must be exactly 11 digits (formatting allowed)
  it("validates phone must be exactly 11 digits (formatting allowed)", () => {
    const { onNext } = setup({
      formData: {
        tutor_first_name: "Jane",
        tutor_second_name: "Doe",
        tutor_username: "janedoe",
        tutor_email: "jane@example.com",
        tutor_phone: "07123 456 78", // only 10 digits
        tutor_password: "password123",
        confirmPassword: "password123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(
      screen.getByText(/Phone number must be exactly 11 digits\./i)
    ).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  // I’m checking password mismatch is caught
  it("shows error when passwords do not match", () => {
    const { onNext } = setup({
      formData: {
        tutor_first_name: "Jane",
        tutor_second_name: "Doe",
        tutor_username: "janedoe",
        tutor_email: "jane@example.com",
        tutor_phone: "07123456789",
        tutor_password: "password123",
        confirmPassword: "different",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(screen.getByText(/Passwords do not match\./i)).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  // I’m asserting happy path: valid form submits and calls onNext with no errors
  it("calls onNext when all fields are valid", () => {
    const { onNext } = setup({
      formData: {
        tutor_first_name: "Jane",
        tutor_second_name: "Doe",
        tutor_username: "janedoe",
        tutor_email: "jane@example.com",
        tutor_phone: "07123 456 789", // 11 digits with spaces
        tutor_password: "password123",
        confirmPassword: "password123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(onNext).toHaveBeenCalledTimes(1);
    // Sanity: no visible error messages
    expect(
      screen.queryByText(/is required\./i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Valid email is required\./i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Phone number must be exactly 11 digits\./i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Passwords do not match\./i)
    ).not.toBeInTheDocument();
  });
});