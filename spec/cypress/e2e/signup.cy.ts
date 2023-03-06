context("signup", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    describe("signup cloud", () => {
        before(() => {
            cy.appScenario("set_cloud");
        });

        it("creates a new account", () => {
            cy.get('[data-id="sign-up-link"]').click();

            cy.signup("myusername", "test@example.com", "password", "password", true);

            cy.contains("Account successfully created.");
            cy.location("pathname").should("contain", "/dashboard/projects");
            cy.contains("Projects");
        });

        it("fails to create a new account if passwords don't match", () => {
            cy.get('[data-id="sign-up-link"]').click();

            cy.signup("myusername", "test@example.com", "password", "xxx", true);

            cy.contains("Password confirmation doesn't match Password.");
        });

        it("fails to create a new account if email is already taken", () => {
            cy.get('[data-id="sign-up-link"]').click();

            cy.signup("myusername", "test1@example.com", "password", "password", true);

            cy.contains("Email has already been taken.");
        });

        it("fails to create a new account if username is already taken", () => {
            cy.get('[data-id="sign-up-link"]').click();

            cy.signup("Test User 1", "test@example.com", "password", "password", true);

            cy.contains("Username has already been taken.");
        });

        it("fails to create a new account if email and username is already taken and passwords do not match", () => {
            cy.get('[data-id="sign-up-link"]').click();

            cy.signup("Test User 1", "test1@example.com", "password", "xxx", true);

            cy.contains("Password confirmation doesn't match Password.");
            cy.contains("Email has already been taken.");
            cy.contains("Username has already been taken.");
        });
    });

    describe("signup on premise", () => {
        before(() => {
            cy.appScenario("set_on_premise");
        });

        it("creates a first account", () => {
            cy.app("clean");

            cy.get('[data-id="sign-up-link"]').click();

            cy.signup("myusername", "test@example.com", "password", "password", true);

            cy.contains("Account successfully created.");
            cy.location("pathname").should("contain", "/dashboard/projects");
            cy.contains("Projects");
        });

        // TODO: Enable after user signup check has been enabled again.
        // it("fails to create a second user for on premise free plan", () => {
        //     cy.get('[data-id="sign-up-link"]').click();

        //     cy.signup("myusername", "test@example.com", "password", "password", true);

        //     cy.contains(
        //         "The maximum number of users for the instance license has been reached. Please inform the instance admin to upgrade the license."
        //     );
        // });
    });
});
