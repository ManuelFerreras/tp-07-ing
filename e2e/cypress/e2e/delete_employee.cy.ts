describe('Delete employee', () => {
  it('removes an employee from the grid', () => {
    const name = `User ${Date.now()}`;
    cy.visit('/employees');

    cy.get('form[aria-label="employee-form"] input[aria-label="name"]').type(name);
    cy.contains('button', 'Crear').click();
    cy.contains('td', name).should('exist');

    cy.on('window:confirm', () => true);
    cy.contains('tr', name).within(() => {
      cy.contains('button', 'Eliminar').click();
    });

    cy.contains('td', name).should('not.exist');
  });
});

