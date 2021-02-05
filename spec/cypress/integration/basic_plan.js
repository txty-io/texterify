context("basic plan", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("imports the plan", () => {
        cy.login("test1@texterify.com", "password");
        cy.get('[data-id="main-menu-instance-settings"]').click();
        cy.get('[data-id="instance-sidebar-licenses"]').click();
        cy.fixture("test_basic.texterify-license").then((fileContent) => {
            cy.get('input[type="file"]').attachFile({
                fileContent: fileContent.toString(),
                fileName: "test_basic.texterify-license"
            });
        });
        cy.get('[data-id="upload-license-button"]').click();
    });
});
