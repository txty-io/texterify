context("add-user", () => {
    let testData;

    beforeEach(() => {
        cy.visit("/");
        cy.fixture("testdata").then((testjson) => {
            testData = testjson;
        });
    });

    it("creates a project and adds a registered user to the project", () => {
        cy.appScenario("set_on_premise");
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.createProject("My test project");

        cy.addUser(testData.login.user2.email);
    });

    // it("creates a project and adds an unregistered user to the project and shows an error message because plan is not high enough", () => {
    //     cy.appScenario("set_on_premise");
    //     cy.login(testData.login.user1.email, testData.login.user1.password);

    //     cy.createProject("My test project");

    //     cy.addUser(testData.login.unregistered.email);
    //     cy.contains("Please upgrade to a paid plan to add users to this project.");
    // });

    // it("creates a project and can't add a registered user to the project and shows an error message because plan is not high enough", () => {
    //     cy.appScenario("set_on_premise");
    //     cy.login(testData.login.user1.email, testData.login.user1.password);

    //     cy.addOrganization("My org");
    //     cy.createProject("My test project", "Organization", true);

    //     cy.addUser(testData.login.user2.email);
    //     cy.contains("Please upgrade to a paid plan to add users to this project.");
    // });

    it("creates a project and adds a registered user to the project", () => {
        cy.appScenario("set_cloud");
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.addOrganization("My org");
        cy.createProject("My test project", "Organization", true);

        cy.addUser(testData.login.user2.email);
        cy.get(".ant-layout-content").should("contain", testData.login.user2.email);
    });

    it("creates a project and adds an unregistered user to the project", () => {
        cy.appScenario("set_cloud");
        cy.login(testData.login.user1.email, testData.login.user1.password);

        cy.addOrganization("My org");
        cy.createProject("My test project", "Organization", true);

        cy.addUser(testData.login.unregistered.email);
        cy.get(".ant-layout-content").should("contain", testData.login.unregistered.email);
    });
});
