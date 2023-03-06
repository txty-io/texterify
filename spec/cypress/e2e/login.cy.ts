context("login", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("logging in with correct credentials succeeds", () => {
        cy.login("test1@example.com", "password");
    });

    it("logging in with invalid password fails and shows error message", () => {
        cy.get('input[id="email"]').type("test1@example.com");
        cy.get('input[id="password"]').type("invalid");
        cy.get("form").submit();
        cy.contains("Invalid login credentials. Please try again.");
    });
});
