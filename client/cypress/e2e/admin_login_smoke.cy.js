import React from "react";

const sel = {
  identifier: 'input[placeholder="Username or Email"]',
  password: 'input[placeholder="Password"]',
  submit: 'button[type="submit"], button:contains("Login")',
};

describe("Admin login smoke (stubbed)", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.intercept("POST", "**/api/admin/login", {
      statusCode: 200,
      body: { status: "success", admin_id: 1, message: "ok" },
    }).as("adminLogin");
    
    cy.intercept("GET", "**/api/admin/overview*", {
      statusCode: 200,
      body: {
        totalRevenue: 0,
        tutorPayouts: 0,
        totalBookings: 0,
        totalUsers: 0,
        newUsers: { students: 0, tutors: 0 },
      },
    }).as("overview");
  });

  it("logs in and lands on admin overview", () => {
    cy.visit("/admin/login");

    cy.get(sel.identifier).should("exist").type("admin@example.com");
    cy.get(sel.password).should("exist").type("Passw0rd!");
    cy.get(sel.submit).should("exist").click();

    cy.wait("@adminLogin");

    cy.visit("/admin/dashboard");
    cy.wait("@overview");

    cy.contains(/overview|revenue/i).should("exist");
  });
});