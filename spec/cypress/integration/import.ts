context("import", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("it does not import 'texterify_*' keys", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject("My import test project");

        cy.addLanguage(
            testData.languages.german.languageCode,
            testData.languages.german.countryCode,
            testData.languages.german.languageName
        );

        cy.get('[data-id="project-sidebar-import"]').click();
        cy.get('[data-id="file-importer-language-tag"]').click();
        cy.get('[data-id="file-importer-file-format-json"]').click();
        cy.get('[data-id="file-importer-file-uploader"]').attachFile("test_file_texterify_timestamp.json");
        cy.get('[data-id="file-importer-submit-button"]').click();
        cy.goToKeys();
        cy.contains("normal_key");
        cy.contains("texterify_timestamp").should("not.exist");
        cy.contains("texterify_").should("not.exist");
        cy.contains("texterify_whatever").should("not.exist");
    });
});
