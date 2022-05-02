context("project", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("creates a project", () => {
        cy.login("test1@texterify.com", "password");
        cy.createProject("My test project");
        cy.location("pathname").should("contain", "/dashboard/projects/");
    });

    it("updates a project name and description", () => {
        cy.login("test1@texterify.com", "password");
        cy.createProject("My test project");
        cy.location("pathname").should("contain", "/dashboard/projects/");
        cy.goToProjectSettings();
        cy.get('[data-id="settings-sidebar-general"]').first().click();
        const newName = "new name";
        const newDescription = "new description";
        cy.get('input[id="name"]').clear().type(newName);
        cy.get('textarea[id="description"]').clear().type(newDescription);
        cy.get('button[form="newProjectForm"]').click();
        cy.goToProjectHome();
        cy.get('[data-id="project-home-name"]').contains(newName);
        cy.get('[data-id="project-home-description"]').contains(newDescription);
    });

    it("deletes a project with translations", () => {
        cy.login("test1@texterify.com", "password");
        cy.createProject("My test project");
        cy.location("pathname").should("contain", "/dashboard/projects/");

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });
        cy.get(".ant-table-container")
            .should("contain", testData.languages.german.languageCodeShort)
            .and("contain", testData.languages.german.countryCodeShort)
            .and("contain", testData.languages.german.languageName);

        cy.addKey({
            name: testData.keys.firstKey.keyName,
            description: testData.keys.firstKey.keyDescription
        });

        cy.get(".ant-table-container")
            .should("contain", testData.keys.firstKey.keyName)
            .and("contain", testData.keys.firstKey.keyDescription);

        cy.contains(testData.keys.firstKey.keyName).parent().next().next().children().click();
        cy.contains(testData.keys.firstKey.keyName)
            .parent()
            .next()
            .next()
            .children()
            .type(testData.keys.firstKey.value);
        cy.clickOutside();
        cy.contains(testData.keys.firstKey.keyName)
            .parent()
            .next()
            .next()
            .children()
            .should("contain", testData.keys.firstKey.value);

        cy.goToProjectSettings();
        cy.get('[data-id="settings-sidebar-advanced"]').click();
        cy.get('[data-id="project-advanced-settings-delete"]').click();
        cy.get(".ant-modal-confirm-btns > .ant-btn-dangerous").click();
        cy.contains("No projects found");
    });
});
