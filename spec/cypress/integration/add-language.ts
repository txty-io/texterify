context("add-language", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("creates a project and adds 3 new languages", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject("My test project");

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });
        cy.get(".ant-table-container")
            .should("contain", testData.languages.german.languageCodeShort)
            .and("contain", testData.languages.german.countryCodeShort)
            .and("contain", testData.languages.german.languageName);

        cy.addLanguage({
            languageCode: testData.languages.english.languageCode,
            countryCode: testData.languages.english.countryCode,
            languageName: testData.languages.english.languageName
        });
        cy.get(".ant-table-container")
            .should("contain", testData.languages.english.languageCodeShort)
            .and("contain", testData.languages.english.countryCodeShort)
            .and("contain", testData.languages.english.languageName);

        cy.addLanguage({
            languageCode: testData.languages.spanish.languageCode,
            countryCode: testData.languages.spanish.countryCode,
            languageName: testData.languages.spanish.languageName
        });
    });
});
