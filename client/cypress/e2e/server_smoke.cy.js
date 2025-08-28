describe("Smoke (API up)", () => {
  it("GET /users -> 200", () => {
    cy.request("/users").its("status").should("eq", 200);
  });

  it("GET /api/tutors -> 200", () => {
    cy.request("/api/tutors").its("status").should("eq", 200);
  });

  it("GET /api/tutors/distinct-fields -> 200", () => {
    cy.request("/api/tutors/distinct-fields").its("status").should("eq", 200);
  });

  it("GET /api/booking/available-dates?tutor_id=10 -> 200", () => {
    cy.request("/api/booking/available-dates?tutor_id=10")
      .its("status")
      .should("eq", 200);
  });
});