context("basic plan", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("imports the plan", () => {
        cy.appScenario("set_on_premise");
        cy.login("test1@texterify.com", "password");
        cy.get('[data-id="main-menu-instance-settings"]').click();
        cy.get('[data-id="instance-sidebar-licenses"]').click();
        cy.get('input[type="file"]').selectFile(
            {
                contents: "cypress/fixtures/test_basic.texterify-license"
            },
            { force: true }
        );

        cy.get('[data-id="upload-license-button"]').click();
    });
});
