import { TicketConversationRepository } from "@lib/data/repositories/TicketConversationRepository";
import { db, ticketConversation } from "../../db";

jest.mock("../../db", () => ({
    db: {
        insert: jest.fn(),
        select: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    ticketConversation: {
        id: expect.any(Number),
        ticketId: expect.any(Number),
        userId: expect.any(String),
        content: expect.any(String),
        creationDate: expect.any(Date),
    },
}));

describe("TicketConversationRepository", () => {
    let repository: TicketConversationRepository;

    beforeEach(() => {
        repository = new TicketConversationRepository();
        jest.clearAllMocks();
    });

    const mockTicketConversation = {
        id: 1,
        ticketId: 101,
        userId: "user_123456789012345678901234567",
        content: "Test conversation content",
        creationDate: new Date(),
    };
    const mockTicketConversation2 = {
        ticketId: mockTicketConversation.ticketId,
        userId: mockTicketConversation.userId,
        content: mockTicketConversation.content,
    };

    it("should create a new ticket conversation", async () => {
        (db.insert as jest.Mock).mockReturnValue({
            values: jest.fn().mockReturnValue({
                returning: jest
                    .fn()
                    .mockResolvedValue([mockTicketConversation]),
            }),
        });

        const result = await repository.createTicketConversation(
            mockTicketConversation,
        );

        expect(result).toEqual(mockTicketConversation);
        expect(db.insert).toHaveBeenCalledWith(ticketConversation);
        expect(db.insert(ticketConversation).values).toHaveBeenCalledWith(
            mockTicketConversation2,
        );
    });

    it("should retrieve a ticket conversation by ID", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([mockTicketConversation]),
            }),
        });

        const result = await repository.getTicketConversationById(1);

        expect(result).toEqual(mockTicketConversation);
        expect(db.select).toHaveBeenCalled();
    });

    it("should throw an error if ticket conversation is not found by ID", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            }),
        });

        await expect(repository.getTicketConversationById(999)).rejects.toThrow(
            "Ticket conversation not found",
        );
    });

    it("should retrieve all ticket conversations by Ticket ID", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    orderBy: jest
                        .fn()
                        .mockResolvedValue([mockTicketConversation]),
                }),
            }),
        });

        const result = await repository.getTicketConversationsByTicketId(101);

        expect(result).toEqual([mockTicketConversation]);
        expect(db.select).toHaveBeenCalled();
    });

    it("should update a ticket conversation", async () => {
        const updatedMock = {
            ...mockTicketConversation,
            content: "Updated content",
        };

        (db.update as jest.Mock).mockReturnValue({
            set: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([updatedMock]),
                }),
            }),
        });

        const result = await repository.updateTicketConversation(updatedMock);

        expect(result).toEqual(updatedMock);
        expect(db.update).toHaveBeenCalled();
    });

    it("should delete a ticket conversation", async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockResolvedValue(1),
        });

        await expect(
            repository.deleteTicketConversation(1),
        ).resolves.not.toThrow();
        expect(db.delete).toHaveBeenCalled();
    });

    it("should throw an error when trying to delete a non-existing ticket conversation", async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockResolvedValue(0),
        });

        await expect(repository.deleteTicketConversation(999)).rejects.toThrow(
            "Ticket conversation not found for deletion",
        );
    });

    it("should retrieve all ticket conversations in a ticket", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([mockTicketConversation]),
            }),
        });

        const result = await repository.getAllTicketConversationsInTicket(101);

        expect(result).toEqual([mockTicketConversation]);
        expect(db.select).toHaveBeenCalled();
    });
});
