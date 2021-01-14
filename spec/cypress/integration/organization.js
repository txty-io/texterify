context("organization", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("creates an organization", () => {
        cy.login("test1@texterify.com", "password");
        cy.get('[data-id="main-menu-organizations"]').click();
        cy.contains("button", "Create organization").click();
        cy.focused().type("My test organization");
        cy.get('[data-id="new-organization-form-create-organization"]').click();
        cy.location("pathname").should("contain", "/dashboard/organizations/");
    });
});
