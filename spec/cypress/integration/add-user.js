context("add-keys", () => {
    let testData

    beforeEach(() => {
        cy.visit("/");
        cy.fixture('testdata').then((testjson) => {
            testData = testjson
        });
    });

    it("creates a private project and adds a registered user to the project", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject('My test project', 'Private');

        cy.addUser(testData.login.user2.email);
        cy.get('.ant-layout-content').should('contain', testData.login.user2.email);
    });

    it("creates a private project and adds an unregistered user to the project", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject('My test project', 'Private');

        cy.addUser(testData.login.invalidUser.email);
        cy.get('.ant-layout-content').should('not.contain', testData.login.invalidUser.email);
        cy.contains('User with that email could not be found.')
    });

});