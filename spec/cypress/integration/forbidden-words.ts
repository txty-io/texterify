context("forbidden-words", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("shows that the feature is not available on the free plan", () => {
        cy.appScenario("set_cloud");
        cy.appScenario("all_entities");
        cy.login("user_owner@texterify.com", "password");
        cy.goToProject("7e9c194a-5cb7-4e6e-9536-942c5268eb2e");
        cy.goToValidations();
        cy.featureNotAvailableInPlanShown("FEATURE_VALIDATIONS_NOT_AVAILABLE");
    });

    it("creates a forbidden words list correctly", () => {
        cy.appScenario("set_cloud");
        cy.appScenario("all_entities");
        cy.login("user_owner@texterify.com", "password");
        cy.goToProject("0e1bda4b-cd24-4585-80bb-d3b80701107a");
        cy.goToValidations();
        cy.clickDataId("forbidden-words-list-button-new");
        cy.get("#name").type("my-forbidden-list");
        cy.get("#languageId").type("d35fa760-dc8a-4ce4-a3d4-2d856f212541");
        cy.get("#content").type("bad\nverybad");
        cy.clickDataId("forbidden-words-list-form-submit");
    });
});
