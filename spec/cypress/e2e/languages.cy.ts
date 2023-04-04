context("languages", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
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

    context("create new", () => {
        it("creates a project and adds 2 new languages", () => {
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
        });

        it("fails to create a project with more than 2 languages due to free limit", () => {
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
                languageName: testData.languages.spanish.languageName,
                expectLimitReached: true
            });
        });
    });
});
