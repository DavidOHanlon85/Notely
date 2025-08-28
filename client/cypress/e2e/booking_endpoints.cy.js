describe("Booking endpoints (read-only)", () => {
  const API = Cypress.env("API_BASE");

  it("GET /api/booking/availability -> 400 when missing params", () => {
    cy.request({ url: `${API}/api/booking/availability`, failOnStatusCode: false })
      .its("status")
      .should("eq", 400);
  });

  it("GET /api/booking/available-dates -> 400 when missing tutor_id", () => {
    cy.request({ url: `${API}/api/booking/available-dates`, failOnStatusCode: false })
      .its("status")
      .should("eq", 400);
  });

  it("GET /api/booking/available-dates?tutor_id=10 -> 200 with JSON", () => {
    cy.request(`${API}/api/booking/available-dates?tutor_id=10`)
      .its("status")
      .should("eq", 200);
  });
});