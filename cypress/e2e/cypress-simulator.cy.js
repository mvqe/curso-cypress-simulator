describe("Cypress Simulator", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("./src/index.html?skipCaptcha=true&chancesOfError=0", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("cookieConsent", "accepted");
      },
    });
  });

  it("Shows an error when entering and running a valid Cypress command without parentheses (cy.visit)", () => {
    cy.run("cy.visit");

    cy.get("#outputArea", { timeout: 6000 })
      .should("be.visible")
      .should("contain", "Error:")
      .and("contain", "Missing parentheses on `cy.visit` command");
  });

  it("Checks the run button disabled and enabled states", () => {
    cy.contains("button", "Run").should("be.visible").and("be.disabled");
    cy.get("#codeInput").should("be.visible").type("Cypress");
    cy.contains("button", "Run").should("be.visible").and("be.enabled");

    cy.get("#codeInput").should("be.visible").clear();
    cy.contains("button", "Run").should("be.visible").and("be.disabled");
  });

  it("Clears the code input when logging off then logging in again", () => {
    cy.run("cy.log()");

    cy.get("#sandwich-menu").should("be.visible").click();
    cy.contains("button", "Logout").should("be.visible").click();
    cy.contains("button", "Login").should("be.visible").click();

    cy.get("#codeInput").should("be.visible").and("be.empty");
  });

  it("Disables the run button when logging off then logging in again", () => {
    cy.get("#codeInput").should("be.visible").type("cy.log()");

    cy.get("#sandwich-menu").should("be.visible").click();
    cy.contains("button", "Logout").should("be.visible").click();
    cy.contains("button", "Login").should("be.visible").click();

    cy.contains("button", "Run").should("be.visible").and("be.disabled");
  });

  it("Clears the code output when logging off then logging in again", () => {
    cy.get("#codeInput").should("be.visible").type("cy.log()");
    cy.contains("button", "Run").should("be.visible").click();

    cy.get("#outputArea", { timeout: 6000 })
      .should("be.visible")
      .and("contain", "Success:", "cy.log() // Logged message ");

    cy.get("#sandwich-menu").should("be.visible").click();
    cy.contains("button", "Logout").should("be.visible").click();
    cy.contains("button", "Login").should("be.visible").click();

    cy.get("#outputArea").should("be.visible").and("be.empty");
  });

  it("Doesn't show the cookie consent banner on the login page", () => {
    cy.clearAllLocalStorage();
    cy.reload();

    cy.contains("button", "Login").should("be.visible");

    cy.get("#cookieConsent").should("not.be.visible");
    cy.window().its("localStorage.cookieConsent").should("not.exist");
  });
});

describe("Cypress Simulator - Cookie Consent", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("./src/index.html?skipCaptcha=true");
  });

  it("Declines on the cookies usage", () => {
    cy.get("#cookieConsent")
      .as("cookieConsentBanner")
      .find("button:contains('Decline')")
      .should("be.visible")
      .click();

    cy.get("@cookieConsentBanner").should("not.be.visible");
    cy.window()
      .its("localStorage.cookieConsent")
      .should("be.equal", "declined");
  });
});
