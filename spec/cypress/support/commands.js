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

Cypress.Commands.add("login", (email, password) => {
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type(password);
    cy.get("form").submit();
    cy.location("pathname").should("eq", "/dashboard/projects");
});

Cypress.Commands.add("createProject", (projectName, projectType) => {
    cy.contains("button", "Create project").click();
    cy.contains("div", "Private").click();
    cy.contains("button", "Next").click();
    cy.focused().type("My test project");
    cy.get('[data-id="new-project-form-create-project"]').click();
    cy.location("pathname").should("contain", "/dashboard/projects/");
});

Cypress.Commands.add("addLanguage", (languageCode, countryCode, languageName) => {
    cy.get('[title="Languages"] > a').click();
    cy.get('.ant-btn-default').click();
    cy.contains('div', 'Select a language').type(languageCode);
    cy.get('body').type('{enter}');
    cy.contains('div', 'Select a country').type(countryCode);
    cy.get('body').type('{enter}');
    cy.get('#name').clear().type(languageName);
    cy.get('.ant-btn-primary').click();
});

Cypress.Commands.add("addKey", (keyName, keyDescription) => {
    cy.get('[title="Keys"] > a').click();
    cy.get('.ant-btn-default').click();
    cy.get('#name').type(keyName);
    cy.get('#description').type(keyDescription);
    cy.get('.ant-btn-primary').click();
});

Cypress.Commands.add("addUser", (userMail) => {
    cy.get('[title="Members"] > a').click();
    cy.get('#name').type(userMail);
    cy.contains('button', 'Invite').click();
});