context("add-keys", () => {
    let testData

    beforeEach(() => {
        cy.visit("/");
        cy.fixture('testdata').then((testjson) => {
            testData = testjson
        });
    });

    it("creates a private project and adds some keys for a language", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject('My test project', 'Private');

        cy.addLanguage(testData.languages.german.languageCode, testData.languages.german.countryCode, testData.languages.german.languageName);
        cy.get('.ant-table-container').should('contain', testData.languages.german.languageCodeShort).and('contain', testData.languages.german.countryCodeShort).and('contain', testData.languages.german.languageName);

        cy.addKey(testData.keys.firstKey.keyName, testData.keys.firstKey.keyDescription);

        cy.get('.ant-table-container').should('contain', testData.keys.firstKey.keyName).and('contain', testData.keys.firstKey.keyDescription);

        // TODO: improve selection of input field
        cy.contains(testData.keys.firstKey.keyName).parent().next().next().children().click();
        cy.contains(testData.keys.firstKey.keyName).parent().next().next().children().type(testData.keys.firstKey.value);
        cy.contains(testData.keys.firstKey.keyName).parent().next().next().click();
        cy.contains(testData.keys.firstKey.keyName).parent().next().next().children().should('contain', testData.keys.firstKey.value);

        cy.addKey(testData.keys.secondKey.keyName, testData.keys.secondKey.keyDescription);

        cy.get('.ant-table-container').should('contain', testData.keys.secondKey.keyName).and('contain', testData.keys.secondKey.keyDescription);

        cy.contains(testData.keys.secondKey.keyName).parent().next().next().children().click();
        cy.contains(testData.keys.secondKey.keyName).parent().next().next().children().type(testData.keys.secondKey.value);
        cy.contains(testData.keys.secondKey.keyName).parent().next().next().click();
        cy.contains(testData.keys.secondKey.keyName).parent().next().next().children().should('contain', testData.keys.secondKey.value);
    });

});