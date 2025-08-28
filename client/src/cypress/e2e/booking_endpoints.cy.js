describe("Booking endpoints (read-only)", () => {
    it("GET /api/booking/availability -> 400 when missing params", () => {
      cy.request({ url: "/api/booking/availability", failOnStatusCode: false })
        .its("status")
        .should("eq", 400);
    });
  
    it("GET /api/booking/available-dates -> 400 when missing tutor_id", () => {
      cy.request({ url: "/api/booking/available-dates", failOnStatusCode: false })
        .its("status")
        .should("eq", 400);
    });
  
    it("GET /api/booking/available-dates?tutor_id=10 -> 200 with JSON", () => {
      cy.request("/api/booking/available-dates?tutor_id=10")
        .its("status")
        .should("eq", 200);
    });
  });