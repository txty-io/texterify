import * as testData from "../fixtures/testdata.json";

context("import", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("it does not import 'texterify_*' keys", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject("My import test project");

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.importFile({
            fileName: "test_file_texterify_timestamp.json",
            fileFormat: "json",
            languageName: testData.languages.german.languageName
        });

        cy.goToKeys();
        cy.contains("normal_key");
        cy.contains("texterify_timestamp").should("not.exist");
        cy.contains("texterify_").should("not.exist");
        cy.contains("texterify_whatever").should("not.exist");
    });

    [
        { id: "json", file: "example_json.json" },
        { id: "json-formatjs", file: "example_json_formatjs.json" },
        { id: "json-poeditor", file: "example_json_poeditor.json" },
        { id: "ios", file: "example_ios.strings" },
        { id: "toml", file: "example_toml.toml" },
        { id: "rails", file: "example_rails.yml" },
        { id: "properties", file: "example_properties.properties" },
        { id: "po", file: "example_po.po" },
        { id: "arb", file: "example_arb.arb.txt" },
        { id: "yaml", file: "example_yaml.yml" },
        { id: "xliff", file: "example_xliff.xlf" }
    ].forEach((fileFormat) => {
        it(`it imports ${fileFormat.id} files`, () => {
            cy.appScenario("default");
            cy.login(testData.login.default.email, testData.login.default.password);
            cy.goToProject(testData.login.default.projects["1"].id);

            cy.importFile({
                fileName: fileFormat.file,
                fileFormat: fileFormat.id,
                languageName: testData.login.default.projects["1"].language_english.name
            });
        });
    });
});
