const API_URL = Cypress.env('API_URL') || 'http://localhost:8080';

describe('Performance reviews flow', () => {
  it('creates and approves a review with visible summaries', () => {
    const employeeName = `Eval User ${Date.now()}`;
    cy.request('POST', `${API_URL}/employees`, { name: employeeName });

    cy.visit('/reviews');

    cy.get('form[aria-label="performance-review-create"]').within(() => {
      cy.get('[aria-label="review-employee"]').select(employeeName);
      cy.get('[aria-label="review-period"]').type('2024-Q4');
      cy.get('[aria-label="review-reviewer"]').type('HR Lead');
      cy.get('[aria-label="review-rating"]').select('4');
      cy.get('[aria-label="review-strengths"]').type('Propósito claro');
      cy.get('[aria-label="review-opportunities"]').type('Planificación trimestral');
      cy.contains('button', 'Crear evaluación').click();
    });

    cy.contains('td', employeeName).should('exist');

    cy.contains('td', employeeName)
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Enviar a revisión').click();
      });

    cy.contains('td', employeeName)
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Aprobar').click();
        cy.contains('td', 'approved');
      });

    cy.get('[data-cy="reviews-summary"]').within(() => {
      cy.contains('[data-cy="review-summary-card"]', employeeName).should('contain.text', 'Promedio');
    });
  });
});


