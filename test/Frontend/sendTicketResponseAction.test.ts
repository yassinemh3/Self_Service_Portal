import { auth } from "@clerk/nextjs/server";
import sendTicketResponseAction from "../../app/_actions/sendTicketResponseAction";
import {
    ticketConversationRepository,
    ticketRepository,
} from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock all dependencies
jest.mock("@clerk/nextjs/server");
jest.mock("@lib/data/repositories");
jest.mock("next/cache");

describe("sendTicketResponseAction", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it("should return an error if the user is not authenticated or not in an organization", async () => {
        // Mock the auth function to return no userId or orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        const formData = new FormData();
        formData.append("ticketId", "1");
        formData.append("content", "Test response");

        const result = await sendTicketResponseAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "User not authenticated or not in an organization",
            error: true,
        });
    });

    it("should return an error if ticketId or content is missing", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        const formData = new FormData();
        formData.append("ticketId", ""); // Missing ticketId
        formData.append("content", ""); // Missing content

        const result = await sendTicketResponseAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Ticket ID and content are required",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        const formData = new FormData();
        formData.append("ticketId", "not-a-number"); // Invalid ticketId
        formData.append("content", ""); // Missing content

        const result = await sendTicketResponseAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: expect.stringContaining(
                "Ticket ID and content are required",
            ),
            error: true,
        });
    });

    it("should successfully send a ticket response if all conditions are met", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository methods
        (
            ticketConversationRepository.createTicketConversation as jest.Mock
        ).mockResolvedValue(true);
        (ticketRepository.updateTicket as jest.Mock).mockResolvedValue(true);

        const formData = new FormData();
        formData.append("ticketId", "1");
        formData.append("content", "Test response");

        const result = await sendTicketResponseAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Ticket response sent successfully",
            success: true,
        });

        // Ensure revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/support/ticket/1");
        expect(revalidatePath).toHaveBeenCalledWith("/support/my-tickets");
    });

    it("should return an error if an exception occurs", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository methods to throw an error
        (
            ticketConversationRepository.createTicketConversation as jest.Mock
        ).mockRejectedValue(new Error("Database error"));

        const formData = new FormData();
        formData.append("ticketId", "1");
        formData.append("content", "Test response");

        const result = await sendTicketResponseAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "An error occurred while sending the ticket response",
            error: true,
        });
    });
});
