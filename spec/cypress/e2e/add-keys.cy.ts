context("add-keys", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("creates a project and adds some keys for a language", () => {
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

        cy.addKey({
            name: testData.keys.firstKey.keyName,
            description: testData.keys.firstKey.keyDescription
        });

        cy.get(".ant-table-container")
            .should("contain", testData.keys.firstKey.keyName)
            .and("contain", testData.keys.firstKey.keyDescription);

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

        cy.addKey({ name: testData.keys.secondKey.keyName, description: testData.keys.secondKey.keyDescription });

        cy.get(".ant-table-container")
            .should("contain", testData.keys.secondKey.keyName)
            .and("contain", testData.keys.secondKey.keyDescription);

        cy.contains(testData.keys.secondKey.keyName).parent().parent().next().next().children().click();
        cy.contains(testData.keys.secondKey.keyName)
            .parent()
            .parent()
            .next()
            .next()
            .children()
            .type(testData.keys.secondKey.value);
        cy.clickOutside();
        cy.contains(testData.keys.secondKey.keyName)
            .parent()
            .parent()
            .next()
            .next()
            .children()
            .should("contain", testData.keys.secondKey.value);
    });

    it("fails to add a key with the prefix 'texterify_' via new key dialog", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);
        cy.createProject("My test project");
        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.addKey({ name: "texterify_timestamp", description: testData.keys.firstKey.keyDescription });
        cy.contains('Key names starting with "texterify_" and "txty_" are reserved and can\'t be used.');
    });

    it("fails to add a key with the prefix 'txty_' via new key dialog", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);
        cy.createProject("My test project");
        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.addKey({ name: "txty_timestamp", description: testData.keys.firstKey.keyDescription });
        cy.contains('Key names starting with "texterify_" and "txty_" are reserved and can\'t be used.');
    });

    it("fails to add a key with the prefix 'texterify_' via keys table", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);
        cy.createProject("My test project");
        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.addKey({ name: "texterify", description: "123" });
        cy.contains("texterify").click();
        cy.contains("texterify").clear().type("texterify_");
        cy.clickOutside();

        cy.contains('Key names starting with "texterify_" and "txty_" are reserved and can\'t be used.');
    });

    it("fails to add a key with the prefix 'txty_' via keys table", () => {
        cy.login(testData.login.user1.email, testData.login.user1.password);
        cy.createProject("My test project");
        cy.addLanguage({
            languageCode: testData.languages.german.languageCode,
            countryCode: testData.languages.german.countryCode,
            languageName: testData.languages.german.languageName
        });

        cy.addKey({ name: "txty", description: "123" });
        cy.contains("txty").click();
        cy.contains("txty").clear().type("txty_");
        cy.clickOutside();

        cy.contains('Key names starting with "texterify_" and "txty_" are reserved and can\'t be used.');
    });
});
