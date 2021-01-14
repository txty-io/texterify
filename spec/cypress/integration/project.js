context("project", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("creates a private project", () => {
        cy.login("test1@texterify.com", "password");
        cy.contains("button", "Create project").click();
        cy.contains("div", "Private").click();
        cy.contains("button", "Next").click();
        cy.focused().type("My test project");
        cy.get('[data-id="new-project-form-create-project"]').click();
        cy.location("pathname").should("contain", "/dashboard/projects/");
    });
});
