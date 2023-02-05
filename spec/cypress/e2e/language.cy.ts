context("language", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("loads languages correctly when searching on last page", () => {
        cy.appScenario("default");
        cy.login("test@texterify.com", "password");
        cy.get('[data-id="project-1bfa0215-46d2-478c-8cba-54df0f89c8d4"]').click();
        cy.get('[data-id="project-sidebar-languages"]').click();
        cy.get(".ant-pagination-item-2").click();
        cy.get('[data-id="project-languages-search"]').type("sh");

        const languages_that_should_be_visible = ["English", "Spanish"];

        languages_that_should_be_visible.forEach((language) => {
            cy.contains(language).should("be.visible");
        });
    });
});
