context("key", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("loads keys correctly when searching on last page", () => {
        cy.appScenario("project_with_keys");
        cy.login("project-with-keys@texterify.com", "password");
        cy.get('[data-id="project-e5705170-2bc1-4fd8-9b41-4fe2b46bfe74"]').click();
        cy.get('[data-id="project-sidebar-keys"]').click();
        cy.get(".ant-pagination-item-2").first().click();
        cy.get('[data-id="project-keys-search"]').type("a");

        const keys_that_should_be_visible = [
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

        keys_that_should_be_visible.forEach((key) => {
            cy.contains(key).should("be.visible");
        });
    });
});
