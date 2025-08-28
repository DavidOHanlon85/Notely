describe('Home page', () => {
    it('should load and display the title', () => {
      cy.visit('http://localhost:5173'); // adjust if your dev server is different
      cy.contains('Notely').should('be.visible');
    });
  });