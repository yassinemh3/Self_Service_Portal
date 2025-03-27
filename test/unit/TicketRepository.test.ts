import { TicketRepository } from "@lib/data/repositories/TicketRepository";
import { db, ticket } from "../../db";
import {
    CreatedTicket,
    TicketStatusEnum,
    UpdatedTicket,
} from "@lib/data/entities";

jest.mock("../../db", () => ({
    db: {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        eq: jest.fn(),
        and: jest.fn(),
        orderBy: jest.fn().mockReturnThis(),
    },
    ticket: {
        id: "id",
        title: "title",
        description: "description",
        status: "status",
        ownerId: "ownerId",
        creationDate: "creationDate",
        organizationId: "organizationId",
        supportId: "supportId",
        updateDate: "updateDate",
    },
}));

describe("TicketRepository", () => {
    let ticketRepository: TicketRepository;

    beforeEach(() => {
        ticketRepository = new TicketRepository();
        jest.clearAllMocks();
    });

    describe("createTicket", () => {
        it("should create a ticket", async () => {
            const ticketData: CreatedTicket = {
                title: "Test Ticket",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const mockTicket = {
                id: 1,
                ...ticketData,
                status: TicketStatusEnum.Open,
                creationDate: new Date(),
                updateDate: null,
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockTicket]),
                }),
            });

            const result = await ticketRepository.createTicket(ticketData);
            expect(result).toEqual(mockTicket);
            expect(db.insert).toHaveBeenCalledWith(ticket);
            expect(db.insert(ticket).values).toHaveBeenCalledWith(ticketData);
        });

        it("should throw an error if validation fails", async () => {
            const invalidTicketData = {
                title: "Test Ticket",
                description: "This is a test ticket",
                ownerId: "invalid_user_id",
                organizationId: "invalid_org_id",
            };

            await expect(
                ticketRepository.createTicket(invalidTicketData as never),
            ).rejects.toThrow();
        });
    });

    describe("getTicketById", () => {
        it("should get a ticket by id", async () => {
            const mockTicket = {
                id: 1,
                title: "Test Ticket",
                description: "This is a test ticket",
                status: TicketStatusEnum.Closed,
                ownerId: "user_12345678901234567890123456789012",
                organizationId: "org_1234567890123456789012345678901",
                creationDate: new Date(),
                updateDate: null,
            };

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockTicket]),
                }),
            });

            const result = await ticketRepository.getTicketById(1);
            expect(result).toEqual(mockTicket);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(ticket);
            expect(db.select().from(ticket).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.arrayContaining([expect.any(String)]),
                }),
            );
        });

        it("should throw an error if ticket not found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            await expect(ticketRepository.getTicketById(1)).rejects.toThrow(
                "Ticket not found",
            );
        });
    });

    describe("getTicketsByUserId", () => {
        it("should get tickets by user id", async () => {
            const mockTickets = [
                {
                    id: 1,
                    title: "Test Ticket 1",
                    description: "This is a test ticket",
                    status: TicketStatusEnum.Open,
                    ownerId: "user_123456789012345678901234567",
                    organizationId: "org_123456789012345678901234567",
                    creationDate: new Date(),
                    updateDate: null,
                },
                {
                    id: 2,
                    title: "Test Ticket 2",
                    description: "This is another test ticket",
                    status: TicketStatusEnum.InProgress,
                    ownerId: "user_123456789012345678901234568",
                    organizationId: "org_123456789012345678901234569",
                    creationDate: new Date(),
                    updateDate: null,
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue(mockTickets),
                    }),
                }),
            });

            const result = await ticketRepository.getTicketsByUserId(
                "user_123456789012345678901234567",
                "org_123456789012345678901234567",
            );
            expect(result).toEqual(mockTickets);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(ticket);
            expect(db.select().from(ticket).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });
        it("should throw an error if the user ID is invalid", async () => {
            const invalidUserId = "invalid_user_id"; // Invalid user ID
            const validOrgId = "org_123456789012345678901234567"; // Valid organization ID

            await expect(
                ticketRepository.getTicketsByUserId(invalidUserId, validOrgId),
            ).rejects.toThrow("String must contain exactly 32 character(s)");
        });

        it("should throw an error if the organization ID is invalid", async () => {
            const validUserId = "user_123456789012345678901234567"; // Valid user ID
            const invalidOrgId = "invalid_org_id"; // Invalid organization ID

            await expect(
                ticketRepository.getTicketsByUserId(validUserId, invalidOrgId),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });

    describe("getTicketsByOrganizationId", () => {
        it("should get tickets by organization id", async () => {
            const mockTickets = [
                {
                    id: 1,
                    title: "Test Ticket 1",
                    description: "This is a test ticket",
                    status: TicketStatusEnum.Open,
                    ownerId: "user_123456789012345678901234567",
                    organizationId: "org_123456789012345678901234567",
                    creationDate: new Date(),
                    updateDate: null,
                },
                {
                    id: 2,
                    title: "Test Ticket 2",
                    description: "This is another test ticket",
                    status: TicketStatusEnum.InProgress,
                    ownerId: "user_123456789012345678901234566",
                    organizationId: "org_123456789012345678901234568",
                    creationDate: new Date(),
                    updateDate: null,
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockResolvedValue(mockTickets),
                    }),
                }),
            });

            const result = await ticketRepository.getTicketsByOrganizationId(
                "org_123456789012345678901234567",
            );
            expect(result).toEqual(mockTickets);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(ticket);
            expect(db.select().from(ticket).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });
        it("should throw an error if the organization ID is invalid", async () => {
            const invalidOrgId = "invalid_org_id"; // Invalid organization ID

            await expect(
                ticketRepository.getTicketsByOrganizationId(invalidOrgId),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });

    describe("updateTicket", () => {
        it("should update a ticket", async () => {
            const ticketData: UpdatedTicket = {
                id: 1,
                title: "Updated Test Ticket",
                description: "This is an updated test ticket",
                status: TicketStatusEnum.Open,
            };

            const mockUpdatedTicket = {
                ...ticketData,
                ownerId: "user_123456789012345678901234566",
                organizationId: "org_123456789012345678901234568",
                creationDate: new Date(),
                updateDate: new Date(),
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest
                            .fn()
                            .mockResolvedValue([mockUpdatedTicket]),
                    }),
                }),
            });

            const result = await ticketRepository.updateTicket(ticketData);
            expect(result).toEqual(mockUpdatedTicket);
            expect(db.update).toHaveBeenCalledWith(ticket);
            expect(db.update(ticket).set).toHaveBeenCalledWith(ticketData);
            expect(
                db.update(ticket).set(ticketData).where,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });

        it("should throw an error if validation fails", async () => {
            const invalidTicketData = {
                id: 1,
                title: "Updated Test Ticket",
                description: "This is an updated test ticket",
                status: "InvalidStatus",
            };

            await expect(
                ticketRepository.updateTicket(invalidTicketData as never),
            ).rejects.toThrow();
        });

        it("should throw an error if ticket not found for update", async () => {
            const ticketData: UpdatedTicket = {
                id: 1,
                title: "Updated Test Ticket",
                description: "This is an updated test ticket",
                status: TicketStatusEnum.InProgress,
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(
                ticketRepository.updateTicket(ticketData),
            ).rejects.toThrow("Ticket not found for update");
        });
    });

    describe("deleteTicket", () => {
        it("should delete a ticket", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            await ticketRepository.deleteTicket(1);
            expect(db.delete).toHaveBeenCalledWith(ticket);
            expect(db.delete(ticket).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });

        it("should throw an error if deletion fails", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest
                    .fn()
                    .mockRejectedValue(new Error("Failed to delete ticket")),
            });

            await expect(ticketRepository.deleteTicket(1)).rejects.toThrow(
                "Failed to delete ticket",
            );
        });
    });
});
