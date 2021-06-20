context("editor", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("the editor site site shows keys with content preview in the sidebar", () => {
        cy.appScenario("set_cloud");

        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.addOrganization("My org");
        cy.createProject("My test project", "Organization", true);

        cy.addLanguage(
            testData.languages.german.languageCode,
            testData.languages.german.countryCode,
            testData.languages.german.languageName
        );

        cy.addKey(testData.keys.firstKey.keyName, testData.keys.firstKey.keyDescription);

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 1);
        cy.get(".editor-key-name").should("have.length", 1);
        cy.get(".editor-key-content").should("have.length", 1);
        cy.get(".editor-key-name").should("contain", testData.keys.firstKey.keyName);
        cy.get(".editor-key-content").should("contain", "Set a default language for preview.");
        cy.get(".editor-key-html").should("not.exist");

        cy.leaveEditor();
        cy.goToLanguages();

        cy.addLanguage(
            testData.languages.english.languageCode,
            testData.languages.english.countryCode,
            testData.languages.english.languageName,
            true
        );

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 1);
        cy.get(".editor-key-name").should("have.length", 1);
        cy.get(".editor-key-content").should("have.length", 1);
        cy.get(".editor-key-name").should("contain", testData.keys.firstKey.keyName);
        cy.get(".editor-key-content").should("contain", "No content");
        cy.get(".editor-key-html").should("not.exist");

        cy.leaveEditor();
        cy.goToKeys();

        cy.addKey(
            testData.keys.secondKey.keyName,
            testData.keys.secondKey.keyDescription,
            testData.keys.secondKey.value,
            true
        );

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 2);
        cy.get(".editor-key-name").should("have.length", 2);
        cy.get(".editor-key-content").should("have.length", 2);

        cy.get(".editor-key-name").eq(1).should("contain", testData.keys.secondKey.keyName);
        cy.get(".editor-key-content").eq(1).should("contain", testData.keys.secondKey.value);
        cy.get(".editor-key-html").should("be.visible");
    });
});
