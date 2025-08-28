describe("Tutors page (smoke)", () => {
    it("loads and handles empty results", () => {
      // stub GET /api/tutors so UI renders predictably
      cy.intercept("GET", `${Cypress.env("API_URL")}/api/tutors*`, {
        statusCode: 200,
        body: { tutors: [], totalTutors: 0 },
      }).as("getTutors");
  
      cy.visit("/tutors");
  
      // page renders + API hit happened
      cy.wait("@getTutors");
      cy.get("body").should("be.visible");
      // optional: assert no crash text
      cy.contains(/error/i).should("not.exist");
    });
  });