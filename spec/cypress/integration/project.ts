context("project", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("creates a project", () => {
        cy.login("test1@texterify.com", "password");
        cy.createProject("My test project");
        cy.location("pathname").should("contain", "/dashboard/projects/");
    });
});
