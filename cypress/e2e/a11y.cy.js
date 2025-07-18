describe("Cypress Simulator - a11y checks", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("./src/index.html?skipCaptcha=true", {
      onBeforeLoad: (win) => {
        win.localStorage.setItem("cookieConsent", "declined");
      },
    });
    cy.injectAxe();
  });

  Cypress._.times(100, () => {
    it("Sucessfully simulates a Cypress command (cy.visit ())", () => {
      cy.run("cy.visit('www.google.com')");

      cy.get("#outputArea", { timeout: 6000 })
        .should("be.visible")
        .should("contain", "Success:")
        .and(
          "contain",
          "cy.visit('www.google.com') // Visited URL 'www.google.com'"
        );

      cy.checkA11y("pre[class='success']");
    });
  });

  it("Shows an error when entering and running an invalid Cypress command (cy.run)", () => {
    cy.run("cy.run()");

    cy.get("#outputArea", { timeout: 6000 })
      .should("be.visible")
      .should("contain", "Error:")
      .and("contain", "Invalid Cypress command: cy.run()");

    cy.checkA11y("pre[class='error']");
  });

  it("Shows a warning when entering and running a not-implemented Cypress command (cy.contains('Login'))", () => {
    cy.run("cy.contains('Login')");

    cy.get("#outputArea", { timeout: 6000 })
      .should("be.visible")
      .should("contain", "Warning:")
      .and(
        "contain",
        "The `cy.contains` command has not been implemented yet."
      );
    cy.checkA11y("pre[class='warning']");
  });

  it("Asks for help and gets common Cypress commands and examples with a link to the docs", () => {
    cy.run("help");

    cy.get("#outputArea", { timeout: 6000 })
      .should("be.visible")
      .should("contain", "Common Cypress commands and examples:")
      .and(
        "contain",
        "cy.visit(url: string)",
        "For more commands and details, visit the official Cypress API documentation."
      );

    cy.checkA11y("pre[id='outputArea']");

    cy.contains("#outputArea a", "official Cypress API documentation")
      .should("be.visible")
      .and("have.attr", "href", "https://docs.cypress.io/api/table-of-contents")
      .and("have.attr", "target", "_blank")
      .and("have.attr", "rel", "noopener noreferrer");
  });

  it("Maximizes and minimizes a simulation result", () => {
    cy.run("cy.run()");

    cy.get("#outputArea", { timeout: 6000 })
      .should("be.visible")
      .should("contain", "Error:")
      .and("contain", "Invalid Cypress command: cy.run()");

    cy.get("#expandIcon").should("be.visible").click();
    cy.checkA11y();
    cy.get("#collapseIcon").should("be.visible").click();
  });

  it("Logs out successfully", () => {
    cy.get("#sandwich-menu").should("be.visible").click();
    cy.get("#logoutButton").should("be.visible").click();
    cy.contains("button", "Login").should("be.visible");

    cy.get("#sandwich-menu").should("not.be.visible");

    cy.checkA11y();
  });

  it("Shows and hides the logout button", () => {
    cy.get("#sandwich-menu").click();
    cy.get("#logoutButton").should("be.visible");

    cy.checkA11y();

    cy.get("#sandwich-menu").click();
    cy.get("#logoutButton").should("not.be.visible");
  });

  it("Shows the running state before showing the final result", () => {
    cy.run("cy.run()");

    cy.contains("button", "Running...").should("be.visible").and("be.disabled");
    cy.contains("#outputArea", "Running... Please wait.").should("be.visible");

    cy.checkA11y();

    cy.contains("button", "Running...", { timeout: 6000 }).should("not.exist");

    cy.contains("button", "Run").should("be.visible");

    cy.contains(
      "#outputArea",
      "Error:",
      "Invalid Cypress command: cy.run()"
    ).should("be.visible");
  });
});

describe("Cypress Simulator - Cookie Consent", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("./src/index.html?skipCaptcha=true");
    cy.injectAxe();
  });

  it("Consents on the cookies usage", () => {
    cy.get("#cookieConsent").as("cookieConsentbanner").should("be.visible");

    cy.checkA11y();

    cy.get("@cookieConsentbanner")
      .find("button:contains('Accept')")
      .should("be.visible")
      .click();

    cy.get("@cookieConsentbanner").should("not.be.visible");
    cy.window()
      .its("localStorage.cookieConsent")
      .should("be.equal", "accepted");
  });
});

describe("Cypress Simulator - Captcha", () => {
  beforeEach(() => {
    cy.visit("./src/index.html");
    cy.contains("button", "Login").should("be.visible").click();
    cy.injectAxe();
  });

  it("Finds no a11y issues on all captcha view states (button enabled/disabled and error)", () => {
    cy.contains("button", "Verify").should("be.visible").should("be.disabled");

    cy.get("#captchaInput").should("be.visible").type("123");
    cy.contains("button", "Verify").should("be.visible").and("be.enabled");

    cy.checkA11y();

    cy.get("#captchaInput").should("be.visible").type(21);
    cy.contains("button", "Verify")
      .should("be.visible")
      .and("be.enabled")
      .click();

    cy.get("#captchaError")
      .should("be.visible")
      .and("have.text", "Incorrect answer, please try again.");

    cy.get("#captchaInput").should("be.visible").clear();
    cy.contains("button", "Verify").should("be.visible").and("be.disabled");

    cy.checkA11y();
  });
});
