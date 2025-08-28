describe("Tutor auth (validation paths)", () => {
    it("POST /api/tutor/login -> 400 on empty body", () => {
      cy.request({
        method: "POST",
        url: "/api/tutor/login",
        body: {},
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });
  
    it("POST /api/tutor/forgot-password -> 400 on invalid email", () => {
      cy.request({
        method: "POST",
        url: "/api/tutor/forgot-password",
        body: { email: "bad" },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });
  
    it("POST /api/tutor/reset-password/:token -> 400 invalid body", () => {
      cy.request({
        method: "POST",
        url: "/api/tutor/reset-password/someToken",
        body: { password: "Passw0rd!", confirmPassword: "" },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });
  });