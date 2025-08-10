import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TutorRegisterStep2 from "./TutorRegisterStep2";

// Mock axios for this file
vi.mock("axios", () => ({ default: { post: vi.fn() } }));
import axios from "axios";

/* Polyfill object URL APIs that jsdom doesn't provide.
   I’m keeping them as vi.fn so we can assert calls. */
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = vi.fn(() => "blob:local-preview");
}
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = vi.fn();
}

// Keep window.alert quiet and assertable
const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

/* Simple harness so I can mutate formData (like the parent would)
   and read it back to assert upload results without changing the component. */
function Harness({ initial = {}, onNext = vi.fn(), onBack = vi.fn() }) {
  const [data, setData] = useState({
    tutor_address_line_1: "",
    tutor_address_line_2: "",
    tutor_city: "",
    tutor_postcode: "",
    tutor_country: "",
    tutor_image: "",
    ...initial,
  });

  return (
    <>
      <TutorRegisterStep2
        formData={data}
        setFormData={setData}
        onNext={onNext}
        onBack={onBack}
      />
      <div data-testid="current-image">{data.tutor_image}</div>
    </>
  );
}

describe("TutorRegisterStep2", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders address fields, file input, and navigation buttons", () => {
    render(<Harness />);

    // Address inputs
    expect(
      screen.getByPlaceholderText("Studio Address Line 1")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Studio Address Line 2 (optional)")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Postcode")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Country")).toBeInTheDocument();

    // File input — select by attribute (roles don’t help for type="file")
    const fileInput = document.querySelector(
      'input[type="file"][name="tutor_image"]'
    );
    expect(fileInput).toBeTruthy();

    // Buttons
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when required fields are missing on submit", async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(
      await screen.findByText("Address Line 1 is required.")
    ).toBeInTheDocument();
    expect(screen.getByText("City is required.")).toBeInTheDocument();
    expect(screen.getByText("Postcode is required.")).toBeInTheDocument();
    expect(screen.getByText("Country is required.")).toBeInTheDocument();
    expect(screen.getByText("Profile image is required.")).toBeInTheDocument();
  });

  it("invokes onBack when the Back button is clicked", () => {
    const onBack = vi.fn();
    render(<Harness onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("uploads image, shows preview, and stores server path in formData", async () => {
    // Simulate successful upload
    axios.post.mockResolvedValueOnce({
      data: { filePath: "/uploads/tutor_images/abc.jpg" },
    });

    render(<Harness />);

    const fileInput = document.querySelector(
      'input[type="file"][name="tutor_image"]'
    );
    const file = new File([new Uint8Array([1, 2, 3])], "avatar.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, {
      target: { files: [file], name: "tutor_image" },
    });

    // Preview URL was generated
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });

    // Multipart post
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3002/api/tutor/upload-image",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );

    // Form state updated with server path
    await waitFor(() => {
      expect(screen.getByTestId("current-image").textContent).toBe(
        "/uploads/tutor_images/abc.jpg"
      );
    });

    // Preview img present and showing the server URL (component updates preview after upload)
    const previewImg = await screen.findByAltText("Preview");
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute(
      "src",
      "http://localhost:3002/uploads/tutor_images/abc.jpg"
    );
  });

  it("handles image upload failure by alerting and clearing preview/state", async () => {
    axios.post.mockRejectedValueOnce(new Error("fail"));

    render(<Harness />);

    const fileInput = document.querySelector(
      'input[type="file"][name="tutor_image"]'
    );
    const file = new File([new Uint8Array([4, 5, 6])], "bad.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, {
      target: { files: [file], name: "tutor_image" },
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    // Preview removed
    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
    // tutor_image cleared
    expect(screen.getByTestId("current-image").textContent).toBe("");
  });

  it("submits and calls onNext when required fields are valid", async () => {
    const onNext = vi.fn();

    render(
      <Harness
        initial={{
          tutor_address_line_1: "123 Music St",
          tutor_city: "Belfast",
          tutor_postcode: "BT1 1AA",
          tutor_country: "UK",
          tutor_image: "/uploads/tutor_images/abc.jpg",
        }}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
  });
});