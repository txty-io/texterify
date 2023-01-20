context("language", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("loads languages correctly when searching on last page", () => {
        cy.appScenario("project_with_languages");
        cy.login("project-with-languages@texterify.com", "password");
        cy.get('[data-id="project-f03a8834-424a-419f-8b92-a7283da76a1f"]').click();
        cy.get('[data-id="project-sidebar-languages"]').click();
        cy.get(".ant-pagination-item-2").click();
        cy.get('[data-id="project-languages-search"]').type("a");

        const languages_that_should_be_visible = [
            "a000",
            "a111",
            "a222",
            "a333",
            "a444",
            "a555",
            "a666",
            "a777",
            "a888",
            "a999"
        ];

        languages_that_should_be_visible.forEach((language) => {
            cy.contains(language).should("be.visible");
        });
    });
});
