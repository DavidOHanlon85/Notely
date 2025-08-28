describe("Booking endpoints (read-only)", () => {
  const API = Cypress.env("API_BASE");

  it("GET /api/booking/available-dates?tutor_id=10 -> 200 with JSON", () => {
    cy.request(`${API}/api/booking/available-dates?tutor_id=10`)
      .its("status")
      .should("eq", 200);
  });
});