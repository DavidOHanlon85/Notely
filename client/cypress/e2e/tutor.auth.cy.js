const API = Cypress.env("API_BASE") || "http://127.0.0.1:3002";

describe("Tutor auth (validation paths)", () => {
  it("POST /api/tutor/login -> 400 or 429", () => {
    cy.request({
      method: "POST",
      url: `${API}/api/tutor/login`,
      body: {},
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [400, 429]);
  });

  it("POST /api/tutor/forgot-password -> 400 or 429", () => {
    cy.request({
      method: "POST",
      url: `${API}/api/tutor/forgot-password`,
      body: { email: "bad" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [400, 429]);
  });

  it("POST /api/tutor/reset-password/:token -> 400 or 429", () => {
    cy.request({
      method: "POST",
      url: `${API}/api/tutor/reset-password/someToken`,
      body: { password: "Passw0rd!", confirmPassword: "" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [400, 429]);
  });
});