context("add-language", () => {
    let testData

    beforeEach(() => {
        cy.visit("/");
        cy.fixture('testdata').then((testjson) => {
          testData = testjson
        });
    });

    it("creates a private project and adds new languages", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject('My test project', 'Private');

        cy.addLanguage(testData.languages.german.languageCode, testData.languages.german.countryCode, testData.languages.german.languageName);
        cy.get('.ant-table-container').should('contain', testData.languages.german.languageCodeShort).and('contain', testData.languages.german.countryCodeShort).and('contain', testData.languages.german.languageName);

        cy.addLanguage(testData.languages.english.languageCode, testData.languages.english.countryCode, testData.languages.english.languageName);
        cy.get('.ant-table-container').should('contain', testData.languages.english.languageCodeShort).and('contain', testData.languages.english.countryCodeShort).and('contain', testData.languages.english.languageName);

        cy.addLanguage(testData.languages.spanish.languageCode, testData.languages.spanish.countryCode, testData.languages.spanish.languageName);
        cy.get('.ant-table-container').should('contain', testData.languages.spanish.languageCodeShort).and('contain', testData.languages.spanish.countryCodeShort).and('contain', testData.languages.spanish.languageName);

    });
});