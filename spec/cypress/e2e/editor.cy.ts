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

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.addKey({
            name: testData.keys.firstKey.keyName,
            description: testData.keys.firstKey.keyDescription
        });

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 1);
        cy.get(".editor-key-name").should("have.length", 1);
        cy.get(".editor-key-content").should("have.length", 1);
        cy.get(".editor-key-name").should("contain", testData.keys.firstKey.keyName);
        cy.get(".editor-key-content").should("contain", "Set a default language for preview.");

        cy.leaveEditor();
        cy.goToLanguages();

        cy.addLanguage({
            languageCode: testData.languages.english.languageCode,
            countryCode: testData.languages.english.countryCode,
            languageName: testData.languages.english.languageName,
            isDefault: true
        });

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 1);
        cy.get(".editor-key-name").should("have.length", 1);
        cy.get(".editor-key-content").should("have.length", 1);
        cy.get(".editor-key-name").should("contain", testData.keys.firstKey.keyName);
        cy.get(".editor-key-content").should("contain", "No content");

        cy.leaveEditor();
        cy.goToKeys();

        cy.addKey({
            name: testData.keys.secondKey.keyName,
            description: testData.keys.secondKey.keyDescription,
            content: testData.keys.secondKey.value,
            isHtml: true
        });

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 2);
        cy.get(".editor-key-name").should("have.length", 2);
        cy.get(".editor-key-content").should("have.length", 2);

        cy.get(".editor-key-name").eq(1).should("contain", testData.keys.secondKey.keyName);
        cy.get(".editor-key-content").eq(1).should("contain", testData.keys.secondKey.value);

        cy.selectKeyInEditor(testData.keys.firstKey.keyName);
        cy.get('[data-id="translation-card"]').should("be.visible");
        cy.selectKeyInEditor(testData.keys.secondKey.keyName);
        cy.get('[data-id="translation-card"]').should("be.visible");
    });

    it("the editor site don't crashes if no language or country code has been set", () => {
        cy.appScenario("set_cloud");

        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.addOrganization("My org");
        cy.createProject("My test project", "Organization", true);

        cy.addLanguage({
            languageName: testData.languages.german.languageName,
            isDefault: true
        });

        cy.addKey({ name: testData.keys.firstKey.keyName, description: testData.keys.firstKey.keyDescription });

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 1);
        cy.get(".editor-key-name").should("have.length", 1);
        cy.get(".editor-key-content").should("have.length", 1);
        cy.get(".editor-key-name").should("contain", testData.keys.firstKey.keyName);
        cy.get(".editor-key-content").should("contain", "No content");

        cy.leaveEditor();
        cy.goToKeys();

        cy.addKey({
            name: testData.keys.secondKey.keyName,
            description: testData.keys.secondKey.keyDescription,
            isHtml: true
        });

        cy.goToEditor();

        cy.get(".editor-key").should("have.length", 2);
        cy.get(".editor-key-name").should("have.length", 2);
        cy.get(".editor-key-content").should("have.length", 2);

        cy.get(".editor-key-name").eq(1).should("contain", testData.keys.secondKey.keyName);
        cy.get(".editor-key-content").eq(1).should("contain", "No content");

        cy.selectKeyInEditor(testData.keys.firstKey.keyName);
        cy.get('[data-id="translation-card"]').should("be.visible");
        cy.selectKeyInEditor(testData.keys.secondKey.keyName);
        cy.get('[data-id="translation-card"]').should("be.visible");
    });
});
