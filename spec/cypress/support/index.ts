// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// load type definitions that come with Cypress module
/// <reference types="cypress" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/interface-name-prefix
        interface Chainable {
            app(file: string): void;
            login(email: string, password: string): void;
            signup(
                username: string,
                email: string,
                password: string,
                passwordConfirmation: string,
                toggleTermsAndPrivacy: boolean
            ): void;
            addOrganization(name: string): void;
            createProject(name: string): void;
            addLanguage(languageCode: string, countryCode: string, languageName: string): void;
            goToKeys(): void;
        }
    }
}

import "./commands";
import "./on-rails";

Cypress.on("window:before:load", (win) => {
    win.indexedDB.deleteDatabase("localforage");
});

beforeEach(() => {
    cy.app("clean");
    cy.app("load_seed");
});
