context("project", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("creates a project", () => {
        cy.login("test1@texterify.com", "password");
        cy.createProject("My test project");
        cy.location("pathname").should("contain", "/dashboard/projects/");
    });

    it("updates a project name and description", () => {
        cy.login("test1@texterify.com", "password");
        cy.createProject("My test project");
        cy.location("pathname").should("contain", "/dashboard/projects/");
        cy.goToProjectSettings();
        cy.get(".ant-collapse-item").first().click();
        const newName = "new name";
        const newDescription = "new description";
        cy.get('input[id="name"]').clear().type(newName);
        cy.get('textarea[id="description"]').clear().type(newDescription);
        cy.get('button[form="newProjectForm"]').click();
        cy.goToProjectHome();
        cy.get('[data-id="project-home-name"]').contains(newName);
        cy.get('[data-id="project-home-description"]').contains(newDescription);
    });
});
