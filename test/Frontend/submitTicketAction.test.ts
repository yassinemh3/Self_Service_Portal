// submitTicketAction.test.ts
import submitTicketAction from "../../app/_actions/submitTicketAction";
import { auth } from "@clerk/nextjs/server";
import {
    ticketRepository,
    ticketScreenshotRepository,
} from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => ({
    auth: jest.fn(),
}));

// Mock both repositories in a single jest.mock call
jest.mock("@lib/data/repositories", () => ({
    ticketRepository: {
        createTicket: jest.fn(),
    },
    ticketScreenshotRepository: {
        createTicketScreenshot: jest.fn(),
    },
}));

jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

// Mock fetch for uploadImages
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () =>
            Promise.resolve({ secure_url: "https://example.com/image.png" }),
    }),
) as jest.Mock;

describe("submitTicketAction", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it("should submit a ticket successfully", async () => {
        // Mock auth to return a valid user and organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository methods
        (ticketRepository.createTicket as jest.Mock).mockResolvedValue({
            id: 1,
            title: "Test Ticket",
            description: "Test Description",
            ownerId: "user_123456789012345678901234567",
            organizationId: "org_123456789012345678901234567",
        });

        (
            ticketScreenshotRepository.createTicketScreenshot as jest.Mock
        ).mockResolvedValue({
            id: 1,
            url: "https://example.com/image.png",
            ticketId: 1,
        });

        // Mock revalidatePath
        (revalidatePath as jest.Mock).mockImplementation(() => {});

        // Create a mock FormData object
        const formData = new FormData();
        formData.append("ticketTitle", "Test Ticket");
        formData.append("ticketDescription", "Test Description");
        const mockFile = new File([""], "test.png", { type: "image/png" });
        formData.append("images", mockFile);

        // Call the action
        const result = await submitTicketAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "Ticket submitted successfully",
            success: true,
            redirectUrl: "/support/ticket/1",
        });

        // Verify that the repository methods were called
        expect(ticketRepository.createTicket).toHaveBeenCalledWith({
            title: "Test Ticket",
            description: "Test Description",
            ownerId: "user_123456789012345678901234567",
            organizationId: "org_123456789012345678901234567",
        });

        expect(
            ticketScreenshotRepository.createTicketScreenshot,
        ).toHaveBeenCalledWith({
            url: "https://example.com/image.png",
            ticketId: 1,
        });

        // Verify that revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/support/my-tickets");
    });

    it("should return an error if the user is not authenticated", async () => {
        // Mock auth to return no user or organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        // Call the action
        const formData = new FormData();
        formData.append("ticketTitle", "Test Ticket");
        formData.append("ticketDescription", "Test Description");

        const result = await submitTicketAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "User not authenticated or not in an organization",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock auth to return a valid user and organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Call the action with invalid form data (empty title)
        const formData = new FormData();
        formData.append("ticketTitle", "");
        formData.append("ticketDescription", "Test Description");

        const result = await submitTicketAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "Title must be at least 5 characters long",
            error: true,
        });
    });

    it("should return an error if the repository throws an error", async () => {
        // Mock auth to return a valid user and organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository's createTicket method to throw an error
        (ticketRepository.createTicket as jest.Mock).mockRejectedValue(
            new Error("Database error"),
        );

        // Call the action with valid form data
        const formData = new FormData();
        formData.append("ticketTitle", "Test Ticket");
        formData.append("ticketDescription", "Test Description");

        const result = await submitTicketAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "An error has occurred while submitting the ticket",
            error: true,
        });
    });
});
