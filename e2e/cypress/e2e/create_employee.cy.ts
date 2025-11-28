describe("Create employee", () => {
  it("creates a new employee and shows it as last row", () => {
    cy.visit("/employees");
    cy.get('form[aria-label="employee-form"] input[aria-label="name"]').type(
      "E2E User"
    );
    cy.contains("button", "Crear").click();
    // wait a moment for network
    cy.wait(300);
    cy.get("table tbody tr:last-child td:nth-child(2)").should(
      "have.text",
      "E2E User"
    );
  });
});
