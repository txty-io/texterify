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

Cypress.Commands.add("createProject", (projectName, projectType, fromOrganizationPage) => {
    if (fromOrganizationPage) {
        cy.get('[data-id="organization-create-project"]').click();
    } else {
        cy.get('[data-id="projects-create-project"]').click();
        if (projectType === "Private") {
            cy.get('[data-id="new-project-form-select-private"]').click();
        } else {
            cy.get('[data-id="new-project-form-select-organization"]').click();
        }
        cy.contains("button", "Next").click();
    }

    cy.focused().type(projectName);
    cy.get('[data-id="new-project-form-create-project"]').click();

    if (fromOrganizationPage) {
        cy.location("pathname").should("contain", "/dashboard/organizations/");
        cy.location("pathname").should("contain", "/projects/");
    } else {
        cy.location("pathname").should("contain", "/dashboard/projects/");
    }
});

Cypress.Commands.add("addLanguage", (languageCode, countryCode, languageName) => {
    cy.get('[title="Languages"] > a').click();
    cy.get(".ant-btn-default").click();
    cy.contains("div", "Select a language").type(languageCode);
    cy.get("body").type("{enter}");
    cy.contains("div", "Select a country").type(countryCode);
    cy.get("body").type("{enter}");
    cy.get("#name").clear().type(languageName);
    cy.get(".ant-btn-primary").click();
});

Cypress.Commands.add("addKey", (keyName, keyDescription) => {
    cy.get('[title="Keys"] > a').click();
    cy.get(".ant-btn-default").click();
    cy.get("#name").type(keyName);
    cy.get("#description").type(keyDescription);
    cy.get(".ant-btn-primary").click();
});

Cypress.Commands.add("addUser", (userMail) => {
    cy.get('[title="Members"] > a').click();
    cy.get("#name").type(userMail);
    cy.contains("button", "Invite").click();
});

Cypress.Commands.add("addOrganization", (name) => {
    cy.get('[data-id="main-menu-organizations"]').click();
    cy.contains("button", "Create organization").click();
    cy.focused().type(name);
    cy.get('[data-id="new-organization-form-create-organization"]').click();
    cy.location("pathname").should("contain", "/dashboard/organizations/");
});

Cypress.Commands.add("clickOutside", () => {
    return cy.get("body").click(0, 0);
});
