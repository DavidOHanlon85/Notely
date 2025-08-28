describe("Admin endpoints (quick checks)", () => {
  const API = Cypress.env("API_BASE");

  it("POST /api/admin/login -> 400 on bad payload", () => {
    cy.request({
      method: "POST",
      url: `${API}/api/admin/login`,
      body: { identifier: "", password: "" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 400);
  });

  it("POST /api/admin/forgot-password -> 400 invalid email", () => {
    cy.request({
      method: "POST",
      url: `${API}/api/admin/forgot-password`,
      body: { email: "nope" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 400);
  });
});