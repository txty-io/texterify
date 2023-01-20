context("key", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("loads keys correctly when searching on last page", () => {
        cy.appScenario("project_with_keys");
        cy.login("project-with-keys@texterify.com", "password");
        cy.get('[data-id="project-e5705170-2bc1-4fd8-9b41-4fe2b46bfe74"]').click();
        cy.get('[data-id="project-sidebar-keys"]').click();
        cy.get(".ant-pagination-item-2").first().click();
        cy.get('[data-id="project-keys-search"]').type("a");

        const keys_that_should_be_visible = [
            "a000",
            "a111",
            "a222",
            "a333",
            "a444",
            "a555",
            "a666",
            "a777",
            "a888",
            "a999"
        ];

        keys_that_should_be_visible.forEach((key) => {
            cy.contains(key).should("be.visible");
        });
    });

    it("counts characters and words of translations correctly", () => {
        cy.appScenario("project_with_keys");
        cy.login("project-with-keys@texterify.com", "password");
        cy.get('[data-id="project-e5705170-2bc1-4fd8-9b41-4fe2b46bfe74"]').click();
        cy.addLanguage({
            languageCode: testData.languages.english.languageCode,
            countryCode: testData.languages.english.countryCode,
            languageName: testData.languages.english.languageName,
            isDefault: true
        });

        // add some content
        cy.goToKeys();
        cy.contains("a000").parent().parent().next().next().children().type("hello world");
        cy.clickOutside();
        cy.goToProjectHome();
        cy.get(".data-id-project-home-word").should("contain", 2);
        cy.get(".data-id-project-home-characters").should("contain", 11);

        // remove text from already existing translation
        cy.goToKeys();
        cy.contains("a000").parent().parent().next().next().children().click();
        cy.focused().clear().type("hello");
        cy.clickOutside();
        cy.goToProjectHome();
        cy.get(".data-id-project-home-word").should("contain", 1);
        cy.get(".data-id-project-home-characters").should("contain", 5);

        // remove all text from already existing translation
        cy.goToKeys();
        cy.contains("a000").parent().parent().next().next().children().click();
        cy.focused().clear();
        cy.clickOutside();
        cy.goToProjectHome();
        cy.get(".data-id-project-home-word").should("contain", 0);
        cy.get(".data-id-project-home-characters").should("contain", 0);

        let totalCharacters = 0;
        let totalWords = 0;

        // add multiple texts to different keys
        const part1 = "the ";
        const part2 = "cake";
        const part3 = "is ";
        const part4 = "a ";
        const part5 = "lie";
        cy.goToKeys();
        cy.contains("a000").parent().parent().next().next().children().click();
        cy.focused().clear().type(part1);
        cy.contains("a111").parent().parent().next().next().children().click();
        cy.focused().clear().type(part2);
        cy.contains("a222").parent().parent().next().next().children().click();
        cy.focused().clear().type(part3);
        cy.contains("a333").parent().parent().next().next().children().click();
        cy.focused().clear().type(part4);
        cy.contains("a444").parent().parent().next().next().children().click();
        cy.focused().clear().type(part5);
        cy.clickOutside();
        cy.goToProjectHome();

        totalCharacters = part1.length + part2.length + part3.length + part4.length + part5.length;
        totalWords = 5;

        cy.get(".data-id-project-home-word").should("contain", totalWords);
        cy.get(".data-id-project-home-characters").should("contain", totalCharacters);

        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName,
            isDefault: false
        });

        // Add text to another language of a key
        const part6 = "hello in other language";
        cy.goToKeys();
        cy.contains("a000").parent().parent().next().next().children().click();
        cy.focused().clear().type(part6);
        cy.clickOutside();
        cy.goToProjectHome();

        totalCharacters = totalCharacters + part6.length;
        totalWords = totalWords + 4;

        cy.get(".data-id-project-home-word").should("contain", totalWords);
        cy.get(".data-id-project-home-characters").should("contain", totalCharacters);

        // Change text of another language of a key
        const part7 = "just hello";
        cy.goToKeys();
        cy.contains("a000").parent().parent().next().next().children().click();
        cy.focused().clear().type(part7);
        cy.clickOutside();
        cy.goToProjectHome();

        totalCharacters = totalCharacters - part6.length + part7.length;
        totalWords = totalWords - 2;

        cy.get(".data-id-project-home-word").should("contain", totalWords);
        cy.get(".data-id-project-home-characters").should("contain", totalCharacters);

        // Delete all languages and check if word and character count has been reset
        cy.goToLanguages();
        cy.get(".ant-checkbox-input").click();
        cy.get('[data-id="languages-delete-selected"]').click();
        cy.get(".ant-modal .ant-btn-dangerous").click();
        cy.goToProjectHome();
        cy.get(".data-id-project-home-word").should("contain", 0);
        cy.get(".data-id-project-home-characters").should("contain", 0);
    });
});
