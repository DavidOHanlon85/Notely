describe("Student auth (validation paths)", () => {
  const API = Cypress.env("API_BASE") || "http://127.0.0.1:3002";

  it("POST /api/student/login -> 400, 404 or 429 on empty body", () => {
    cy.request({
      method: "POST",
      url: "/api/student/login",
      body: {},
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [400, 404, 429]);
  });

  it("POST /api/student/forgot-password -> 400 or 429 on invalid email", () => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("API_BASE")}/api/student/forgot-password`,
      body: { email: "not-an-email" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [400, 429]);
  });

  it("POST /api/student/reset-password/:token -> 400 or 429 missing/invalid body", () => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("API_BASE")}/api/student/reset-password/someToken`,
      body: { password: "Passw0rd!", confirmPassword: "" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [400, 429]);
  });
});