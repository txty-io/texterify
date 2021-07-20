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

Cypress.Commands.add("createProject", (projectName, fromOrganizationPage) => {
    if (fromOrganizationPage) {
        cy.get('[data-id="organization-create-project"]').click();
    } else {
        cy.addOrganization("org-for-new-project");
        cy.get('[data-id="organization-create-project"]').click();
        // cy.get('[data-id="projects-create-project"]').click();
        // cy.get('[data-id="new-project-form-select-organization"]').click();
        // cy.contains("button", "Next").click();
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

Cypress.Commands.add("addLanguage", (languageCode, countryCode, languageName, isDefault) => {
    cy.get('[title="Languages"] > a').click();
    cy.get(".ant-btn-default").click();
    cy.contains("div", "Select a language").type(languageCode);
    cy.get("body").type("{enter}");
    cy.contains("div", "Select a country").type(countryCode);
    cy.get("body").type("{enter}");
    cy.get("#name").clear().type(languageName);
    if (isDefault) {
        cy.get("#is_default").click();
    }
    cy.get(".ant-btn-primary").click();
});

Cypress.Commands.add("addKey", (keyName, keyDescription, keyContent, isHtml) => {
    cy.get('[title="Keys"] > a').click();
    cy.get(".ant-btn-default").click();
    cy.get("#name").type(keyName);
    cy.get("#description").type(keyDescription);
    if (isHtml) {
        cy.get("#htmlEnabled").click();

        if (keyContent) {
            cy.wait(1000); // wait until the editor has loaded
            cy.get(".defaultLanguageHTMLContent").find(".codex-editor").type(keyContent);
            cy.wait(500); // wait until editor has saved content
        }
    } else if (keyContent) {
        cy.get("#defaultLanguageContent").type(keyContent);
    }
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
    cy.wait(500);
    cy.get('[data-id="main-menu-organizations"]').click();
    cy.contains(name).click();
    cy.location("pathname").should("contain", "/dashboard/organizations/");
});

Cypress.Commands.add("goToEditor", () => {
    cy.get('[data-id="project-sidebar-editor"]').click();
});

Cypress.Commands.add("leaveEditor", () => {
    cy.get(".editor-back").click();
});

Cypress.Commands.add("goToLanguages", () => {
    cy.get('[data-id="project-sidebar-languages"]').click();
});

Cypress.Commands.add("goToKeys", () => {
    cy.get('[data-id="project-sidebar-keys"]').click();
});

Cypress.Commands.add("clickOutside", () => {
    return cy.get("body").click(0, 0);
});
