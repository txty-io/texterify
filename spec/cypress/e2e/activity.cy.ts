context("activity", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("shows the activity site", () => {
        cy.login("test1@texterify.com", "password");
        cy.addOrganization("My org");
        cy.get('[data-id="main-menu-activity"]').click();
        cy.get(".ant-layout-content").should("contain", "Activity");
        cy.get(".ant-layout-content").should("contain", "No activity available");
        cy.compareSnapshot("activity");
    });
});
