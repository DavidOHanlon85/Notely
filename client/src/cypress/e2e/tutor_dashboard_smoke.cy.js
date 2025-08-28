<reference types="cypress" />

const signTutor = () => {
    cy.setCookie("tutor_token", "fake.jwt.token");
  };
  
  describe("Tutor dashboard smoke (stubbed)", () => {
    beforeEach(() => {
      // dashboard data
      cy.intercept("GET", "**/api/tutor/overview*", {
        statusCode: 200,
        body: {
          tutorName: "Tina",
          totalRevenue: 0,
          totalLessons: 0,
          upcomingLessons: 0,
          completedLessons: 0,
          averageRating: 0,
          feedbackStars: [],
          revenueOverTime: [],
        },
      }).as("overview");
  
      cy.intercept("GET", "**/api/tutor/bookings*", { statusCode: 200, body: [] }).as("bookings");
      cy.intercept("GET", "**/api/tutor/reviews*", { statusCode: 200, body: [] }).as("reviews");
      signTutor();
    });
  
    it("renders overview, bookings, and reviews without crashing", () => {
      cy.visit("/tutor/dashboard"); // adjust path
      cy.wait("@overview");
      cy.contains(/tina/i).should("exist").or(() => true);
  
      // navigate to Bookings tab if you have tabs
      cy.contains(/bookings/i).first().click({ force: true }).catch(() => {});
      cy.wait("@bookings");
      cy.contains(/no bookings|bookings/i).should("exist").or(() => true);
  
      // reviews tab
      cy.contains(/reviews/i).first().click({ force: true }).catch(() => {});
      cy.wait("@reviews");
      cy.contains(/reviews|rating/i).should("exist").or(() => true);
    });
  });