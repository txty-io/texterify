// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import "cypress-file-upload";

Cypress.Commands.add("login", (email, password) => {
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type(password);
    cy.get("form").submit();
    cy.location("pathname").should("eq", "/dashboard/projects");
});

Cypress.Commands.add("signup", (username, email, password, passwordConfirmation, toggleTermsAndPrivacy) => {
    cy.focused().type(username);
    cy.get('[id="email"]').type(email);
    cy.get('[id="password"]').type(password);
    cy.get('[id="passwordConfirmation"]').type(passwordConfirmation);
    if (toggleTermsAndPrivacy) {
        cy.get('[id="agreeTermsOfServiceAndPrivacyPolicy"]').click();
    }
    cy.get('[data-id="sign-up-submit"]').click();
});
