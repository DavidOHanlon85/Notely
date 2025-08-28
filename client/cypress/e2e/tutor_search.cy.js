describe("Tutor search page (smoke test)", () => {
  beforeEach(() => {
    // Stub auth routes
    cy.intercept("GET", "**/api/student/me", { statusCode: 200, body: {} }).as("studentMe");
    cy.intercept("GET", "**/api/tutor/me", { statusCode: 200, body: {} }).as("tutorMe");
    cy.intercept("GET", "**/api/admin/me", { statusCode: 200, body: {} }).as("adminMe");

    // Stub distinct fields (optional)
    cy.intercept("GET", "**/api/tutors/distinct-fields", {
      statusCode: 200,
      body: { instruments: ["Piano", "Guitar"], cities: ["London", "Manchester"] },
    }).as("distinctFields");
  });

  it("loads the tutor search page", () => {
    cy.visit("/tutors");

    // Confirm page has loaded — use any simple text visible on the page
    cy.contains("Find Your Music Tutor").should("exist"); // or any stable heading present
  });
});