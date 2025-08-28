describe("Tutors page (smoke)", () => {
  beforeEach(() => {
    // Stub common auth routes
    cy.intercept("GET", "**/api/student/me", { statusCode: 200, body: {} }).as("studentMe");
    cy.intercept("GET", "**/api/tutor/me", { statusCode: 200, body: {} }).as("tutorMe");
    cy.intercept("GET", "**/api/admin/me", { statusCode: 200, body: {} }).as("adminMe");

    // Stub distinct-fields so dropdowns render
    cy.intercept("GET", "**/api/tutors/distinct-fields", {
      statusCode: 200,
      body: {
        instruments: ["Piano", "Guitar"],
        cities: ["London", "Belfast"],
      },
    }).as("distinctFields");
  });

  it("loads the page and shows basic UI components", () => {
    cy.visit("/tutors");

    // Wait for dropdown data
    cy.wait("@distinctFields");

    // Basic page check
    cy.get("body").should("be.visible");

    // Check More Filters toggle renders
    cy.contains("More Filters").should("exist");

    // Check instrument dropdown appears
    cy.get('[name="instrument"]').should("exist");

    // Check city dropdown appears
    cy.get('[name="city"]').should("exist");

    // Ensure no crash
    cy.contains(/error/i).should("not.exist");
  });
});