Cypress.Commands.add("loginWithClerk", () => {
    const clerkInstanceUrl = "https://regular-stingray-41.clerk.accounts.dev";
    const clerkApiKey = "sk_test_DXCGcmIbLZMGFzrUSXq3lMpWm7ooxzB6HWWGvIlJZK";

    // Make a POST request to Clerk's sign-in endpoint
    cy.request({
        method: "POST",
        url: `${clerkInstanceUrl}/v1/client/sign_ins`, // Correct endpoint for signing in
        headers: {
            Authorization: `Bearer ${clerkApiKey}`,
        },
        body: {
            identifier: "clerk-admin@proton.me",
            password: "fwe-self-service-2425",
        },
    }).then((response) => {
        expect(response.status).to.eq(200);

        // Extract the session token from the response
        const sessionToken = response.body.client.sessions[0].session_token;

        // Set the session cookie
        cy.setCookie("__session", sessionToken); // Clerk uses '__session' cookie
    });
});

describe("Submit Ticket", () => {
    it("should allow a user to submit a support ticket", () => {
        // Fill in the subject field
        cy.get('input[name="ticketTitle"]').type("Test Issue");

        // Fill in the description field
        cy.get('textarea[name="ticketDescription"]').type(
            "This is a test issue for E2E testing.",
        );

        // Upload an image
        const filePath = "test-image.png";
        cy.get('input[type="file"]').attachFile(filePath);

        // Click the submit button
        cy.get('button[type="submit"]').click();

        // Assert success message or redirection
        cy.contains("Ticket submitted successfully").should("be.visible");
        cy.url().should("include", "/support/ticket/");
    });
});
