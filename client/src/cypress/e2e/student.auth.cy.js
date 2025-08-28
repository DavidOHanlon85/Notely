describe("Student auth (validation paths)", () => {
    it("POST /api/student/login -> 400 on empty body", () => {
      cy.request({
        method: "POST",
        url: "/api/student/login",
        body: {},
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });
  
    it("POST /api/student/forgot-password -> 400 on invalid email", () => {
      cy.request({
        method: "POST",
        url: "/api/student/forgot-password",
        body: { email: "not-an-email" },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });
  
    it("POST /api/student/reset-password/:token -> 400 missing/invalid body", () => {
      cy.request({
        method: "POST",
        url: "/api/student/reset-password/someToken",
        body: { password: "Passw0rd!", confirmPassword: "" },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 400);
    });
  });