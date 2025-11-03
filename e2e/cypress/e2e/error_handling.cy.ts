describe('Error handling', () => {
  it('shows validation error 422', () => {
    cy.intercept('POST', '**/employees', {
      statusCode: 422,
      body: { error: 'name is required' },
    }).as('create422');
    cy.visit('/employees');
    cy.get('form[aria-label="employee-form"] input[aria-label="name"]').type('Some Name');
    cy.contains('button', 'Create').click();
    cy.wait('@create422');
    cy.get('[role="alert"]').should('contain.text', 'name is required');
  });

  it('shows generic error 500', () => {
    cy.intercept('PUT', '**/employees/*', {
      statusCode: 500,
      body: { error: 'internal error' },
    }).as('update500');
    cy.visit('/employees');
    // ensure something to edit
    cy.get('form[aria-label="employee-form"] input[aria-label="name"]').type('User Err');
    cy.contains('button', 'Create').click();
    cy.wait(200);
    cy.get('table tbody tr:last-child td:last-child button').click();
    cy.get('form[aria-label="employee-form"]').last().find('input[aria-label="name"]').clear().type('X');
    cy.contains('button', 'Update').click();
    cy.wait('@update500');
    cy.get('[role="alert"]').should('contain.text', 'internal error');
  });
});


