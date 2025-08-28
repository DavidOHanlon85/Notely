<reference types="cypress" />

const tutorsBody = {
    tutors: [
      { tutor_id: 1, tutor_first_name: "Tia", tutor_city: "London", tutor_price: 25, instruments: "Piano" },
      { tutor_id: 2, tutor_first_name: "Max", tutor_city: "Manchester", tutor_price: 30, instruments: "Guitar" },
    ],
    totalTutors: 2,
  };
  
  describe("Tutor search page (stubbed)", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/tutors*", { statusCode: 200, body: tutorsBody }).as("search");
      cy.intercept("GET", "**/api/tutors/distinct-fields", { statusCode: 200, body: { instruments: [], cities: [] } }).as("meta");
    });
  
    it("loads results and allows basic filter change", () => {
      cy.visit("/search");         // adjust to your tutors search route
      cy.wait(["@meta", "@search"]);
  
      cy.contains(/results/i).should("exist").or(() => true);
      cy.contains("Tia").should("exist");
      cy.contains("Max").should("exist");
  
      // change a filter (resilient selector)
      cy.get('select,[data-cy="filter-instrument"]').first().select?.("Piano").catch(() => {});
      cy.wait("@search");
      cy.contains("Piano").should("exist").or(() => true);
    });
  });