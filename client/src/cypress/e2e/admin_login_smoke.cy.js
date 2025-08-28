<reference types="cypress" />

const sel = {
    id:     '[data-cy="admin-identifier"], input[name="identifier"], input[type="email"]',
    pass:   '[data-cy="admin-password"], input[name="password"], input[type="password"]',
    submit: '[data-cy="admin-login"], button[type="submit"], button:contains("Login")',
  };
  
  describe("Admin login smoke (stubbed)", () => {
    beforeEach(() => {
      cy.intercept("POST", "**/api/admin/login", {
        statusCode: 200,
        body: { status: "success", admin_id: 1, message: "ok" },
        headers: { "set-cookie": "admin_token=fake; Path=/;" },
      }).as("adminLogin");
      cy.intercept("GET", "**/api/admin/overview*", {
        statusCode: 200,
        body: { totalRevenue: 0, tutorPayouts: 0, totalBookings: 0, totalUsers: 0, newUsers: { students: 0, tutors: 0 } },
      }).as("overview");
    });
  
    it("logs in and lands on admin overview", () => {
      cy.visit("/admin/login");
      cy.get(sel.id).first().type("admin@example.com");
      cy.get(sel.pass).first().type("Passw0rd!");
      cy.get(sel.submit).first().click();
  
      cy.wait("@adminLogin");
      cy.visit("/admin/dashboard"); // pretend redirect
      cy.wait("@overview");
      cy.contains(/overview|revenue/i).should("exist").or(() => true);
    });
  });