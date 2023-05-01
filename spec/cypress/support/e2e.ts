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
            app(command: "clean" | "factory_bot" | "load_seed_cli" | "load_seed" | "log_fail"): void;
            login(email: string, password: string): void;
            signup(
                username: string,
                email: string,
                password: string,
                passwordConfirmation: string,
                toggleTermsAndPrivacy: boolean
            ): void;
            addOrganization(name: string): void;
            createProject(name: string, description?: string, fromOrganizationPage?: boolean): void;
            addKey(data: { name: string; description?: string; content?: string; isHtml?: boolean }): void;
            appScenario(
                scenario: "project_with_keys" | "set_cloud" | "set_on_premise" | "all_entities" | "default"
            ): void;
            addLanguage(data: {
                languageName: string;
                languageCode?: string;
                countryCode?: string;
                isDefault?: boolean;
                expectLimitReached?: boolean;
            }): void;
            goToKeys(): void;
            goToProject(projectId: string): void;
            goToProjectHome(): void;
            goToLanguages(): void;
            goToValidations(): void;
            goToForbiddenWords(): void;
            goToProjectSettings(): void;
            goToEditor(): void;
            selectKeyInEditor(name: string);
            leaveEditor(): void;
            clickOutside(): void;
            clickDataId(id: string): void;
            featureNotAvailableInPlanShown(id: string): void;
            addUser(email: string): void;
            checkIfKeyExists(options: { key: string; description?: string; content?: string }): void;
            importFile(options: { fileName: string; fileFormat: string; languageName: string; searchFor: string });
            compareSnapshot(name: string, threshold?: number);
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

after(() => {
    cy.task("generateReport");
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
import compareSnapshotCommand = require("cypress-image-diff-js/dist/command");
compareSnapshotCommand();
