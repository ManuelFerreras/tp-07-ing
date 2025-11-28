const API_URL = Cypress.env('API_URL') || 'http://localhost:8080';

describe('Payroll flow', () => {
  it('registers a payroll record and shows totals', () => {
    const employeeName = `Payroll User ${Date.now()}`;
    cy.request('POST', `${API_URL}/employees`, { name: employeeName });

    cy.visit('/payroll');

    cy.get('form[aria-label="payroll-form"]').within(() => {
      cy.get('[aria-label="payroll-employee"]').select(employeeName);
      cy.get('[aria-label="payroll-period"]').type('2024-12');
      cy.get('[aria-label="payroll-base-salary"]').clear().type('1000');
      cy.get('[aria-label="payroll-overtime-hours"]').clear().type('5');
      cy.get('[aria-label="payroll-overtime-rate"]').clear().type('60');
      cy.get('[aria-label="payroll-bonuses"]').clear().type('150');
      cy.get('[aria-label="payroll-deductions"]').clear().type('50');
      cy.contains('button', 'Registrar nómina').click();
    });

    cy.contains('td', employeeName)
      .parent('tr')
      .within(() => {
        cy.contains('td', '$');
        cy.contains('td', '2024-12');
      });

    cy.contains('.chakra-card', 'Total acumulado').should('contain.text', '$');
  });
});


