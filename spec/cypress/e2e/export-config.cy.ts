context("export-config", () => {
    let testData;
    const downloadsFolder = "cypress/downloads";

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("creates a project and an export config and exports it", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject("My test project");

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.addKey({
            name: testData.keys.firstKey.keyName,
            description: testData.keys.firstKey.keyDescription
        });

        cy.contains(testData.keys.firstKey.keyName).parent().parent().next().next().children().click();
        cy.contains(testData.keys.firstKey.keyName)
            .parent()
            .parent()
            .next()
            .next()
            .children()
            .type(testData.keys.firstKey.value);
        cy.clickOutside();
        cy.contains(testData.keys.firstKey.keyName)
            .parent()
            .parent()
            .next()
            .next()
            .children()
            .should("contain", testData.keys.firstKey.value);

        cy.get('[data-id="project-sidebar-export"]').click();
        cy.contains("a", "Create an export config").click();
        cy.get('[data-id="export-configs-table-new-button"]').click();
        cy.get("#name").type("name");
        cy.contains("div", "Select a file format").type("json");
        cy.get("body").type("{enter}");
        cy.get("#filePath").type("testPath");
        cy.get(".ant-modal-footer > div > .ant-btn-primary").click();

        cy.contains("a", "Download").click();
        cy.get(".ant-btn").click();
    });
});
