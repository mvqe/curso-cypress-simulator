Cypress.Commands.add("login", () => {
  const setup = () => {
    cy.visit("./src/index.html?skipCaptcha=true");
    cy.contains("button", "Login").click();
  };

  const validate = () => {
    cy.visit("./src/index.html");
    cy.contains("button", "Login", { timeout: 1000 }).should("not.be.visible");
  };

  const options = {
    cacheAcrossSpecs: true,
    validate,
  };

  cy.session("sessionId", setup, options);
});

Cypress.Commands.add("run", (cmd) => {
  cy.get("#codeInput").should("be.visible").type(cmd);
  cy.get("#runButton").should("be.visible").and("be.enabled").click();
});
