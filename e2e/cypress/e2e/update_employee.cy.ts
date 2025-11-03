describe('Update employee', () => {
  it('edits the last employee and verifies the change', () => {
    cy.visit('/employees');
    // ensure at least one employee exists
    cy.get('form[aria-label="employee-form"] input[aria-label="name"]').type('User To Edit');
    cy.contains('button', 'Create').click();
    cy.wait(200);
    // click edit on last row
    cy.get('table tbody tr:last-child td:last-child button').click();
    // target the last (edit) form explicitly
    cy.get('form[aria-label="employee-form"]').last().find('input[aria-label="name"]').clear().type('User Edited');
    cy.contains('button', 'Update').click();
    cy.wait(200);
    cy.get('table tbody tr:last-child td:nth-child(2)').should('have.text', 'User Edited');
  });
});


