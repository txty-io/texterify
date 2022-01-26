context("organization", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("creates an organization", () => {
        cy.login("test1@texterify.com", "password");
        cy.addOrganization("My org");
    });
});
