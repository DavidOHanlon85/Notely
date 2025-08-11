import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import StudentProfilePage from "./StudentProfile";

vi.mock("axios");

describe("StudentProfilePage", () => {
  it("fetches profile, fills form, and submits updated data", async () => {
    // Mock GET profile
    axios.get.mockResolvedValueOnce({
      data: {
        student_first_name: "John",
        student_last_name: "Doe",
        student_username: "johndoe",
        student_email: "john@example.com",
        student_phone: "1234567890",
      },
    });

    // Mock PATCH
    axios.patch.mockResolvedValueOnce({ data: { status: "success" } });

    render(<StudentProfilePage />);

    // Wait for prefilled data
    expect(await screen.findByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();

    // Change one field
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "Jane" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /update profile/i }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:3002/api/student/profile",
        expect.objectContaining({
          student_first_name: "Jane",
          student_last_name: "Doe",
        }),
        expect.any(Object)
      )
    );
  });
});