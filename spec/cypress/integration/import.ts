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

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.get('[data-id="project-sidebar-import"]').click();
        cy.get('[data-id="file-importer-language-tag"]').click();
        cy.get('[data-id="file-importer-file-format-json"]').click();
        cy.get('[data-id="files-importer-files-uploader"]').selectFile(
            "cypress/fixtures/test_file_texterify_timestamp.json",
            { force: true }
        );
        cy.get('[data-id="files-importer-submit-button"]').click();
        cy.goToKeys();
        cy.contains("normal_key");
        cy.contains("texterify_timestamp").should("not.exist");
        cy.contains("texterify_").should("not.exist");
        cy.contains("texterify_whatever").should("not.exist");
    });

    it("it imports POEditor json files", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject("My import test project");

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.importFile("test_poeditor.json");

        cy.checkIfKeyExists({
            key: "welcome_screen.app_title",
            content: "Texterify",
            description: "this comment is shown as description"
        });
        cy.checkIfKeyExists({
            key: "welcome_screen.app_welcome_text",
            content: "Hello World!",
            description: "this comment is shown as a welcome text"
        });
    });
});
