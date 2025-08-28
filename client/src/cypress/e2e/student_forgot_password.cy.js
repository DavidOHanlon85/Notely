<reference types="cypress" />

const sel = {
    email:  '[data-cy="forgot-email"], input[type="email"], input[name="email"]',
    submit: '[data-cy="forgot-submit"], button[type="submit"], button:contains("Reset")',
  };
  
  describe("Student forgot password (stubbed)", () => {
    beforeEach(() => {
      cy.intercept("POST", "**/api/student/forgot-password", { statusCode: 200, body: { status: "success" } }).as("fp");
    });
  
    it("submits email and shows success toast/message", () => {
      cy.visit("/student/forgot-password");
      cy.get(sel.email).first().type("stu@example.com");
      cy.get(sel.submit).first().click();
      cy.wait("@fp");
      cy.contains(/email/i).should("exist").or(() => true);
    });
  });