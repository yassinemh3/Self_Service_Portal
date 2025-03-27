import { auth } from "@clerk/nextjs/server";
import changeTicketStatusAction from "../../app/_actions/changeTicketStatusAction";
import { ticketRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";
import { TicketStatusEnum } from "@lib/data/entities";

// Mock the dependencies
jest.mock("@clerk/nextjs/server");
jest.mock("@lib/data/repositories");
jest.mock("next/cache");

describe("changeTicketStatusAction", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it("should return an error if the user is not authenticated", async () => {
        // Mock the auth function to return no userId
        (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

        const formData = new FormData();
        formData.append("status", TicketStatusEnum.Closed);
        formData.append("ticketId", "1");

        const result = await changeTicketStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "User not authenticated",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock the auth function to return a userId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
        });

        const formData = new FormData();
        formData.append("status", "InvalidStatus");
        formData.append("ticketId", "not-a-number");

        const result = await changeTicketStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: expect.stringContaining("Invalid status"),
            error: true,
        });
    });

    it("should return an error if the user does not have permission to change the ticket status", async () => {
        // Mock the auth function to return a userId and no permission
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            has: jest.fn().mockReturnValue(false),
        });

        // Mock the ticketRepository to return a ticket with a different owner
        (ticketRepository.getTicketById as jest.Mock).mockResolvedValue({
            ownerId: "org_123456789012345678901234567",
            status: TicketStatusEnum.Open,
        });

        const formData = new FormData();
        formData.append("status", TicketStatusEnum.Closed);
        formData.append("ticketId", "1");

        const result = await changeTicketStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message:
                "You do not have permission to change this ticket's status",
            error: true,
        });
    });

    it("should return a success message if the ticket status is updated", async () => {
        // Mock the auth function to return a userId and permission
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            has: jest.fn().mockReturnValue(true),
        });

        // Mock the ticketRepository to return a ticket with the same owner
        (ticketRepository.getTicketById as jest.Mock).mockResolvedValue({
            ownerId: "org_123456789012345678901234567",
            status: TicketStatusEnum.Open,
        });

        // Mock the updateTicket method
        (ticketRepository.updateTicket as jest.Mock).mockResolvedValue(true);

        const formData = new FormData();
        formData.append("status", TicketStatusEnum.Closed);
        formData.append("ticketId", "1");

        const result = await changeTicketStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Ticket status updated",
            success: true,
        });

        // Ensure revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/support/ticket/1");
    });

    it("should return an error if an exception is thrown", async () => {
        // Mock the auth function to throw an error
        (auth as unknown as jest.Mock).mockRejectedValue(
            new Error("Auth error"),
        );

        const formData = new FormData();
        formData.append("status", TicketStatusEnum.Closed);
        formData.append("ticketId", "1");

        const result = await changeTicketStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "An error has occurred while submitting the ticket",
            error: true,
        });
    });
});
