import { TicketRepository } from "@lib/data/repositories/TicketRepository";
import { db, ticket } from "../../db";
import {
    CreatedTicket,
    TicketStatusEnum,
    UpdatedTicket,
} from "@lib/data/entities";


describe("TicketRepository Integration Tests", () => {
    let ticketRepository: TicketRepository;

    beforeAll(async () => {
        // Initialize the repository
        ticketRepository = new TicketRepository();

        // Ensure the database is clean before running tests
        await db.delete(ticket);
    });

    afterEach(async () => {
        // Clean up the database after each test
        await db.delete(ticket);
    });

    describe("createTicket", () => {
        it("should create a ticket in the database", async () => {
            const ticketData: CreatedTicket = {
                title: "Test Ticket",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const createdTicket = await ticketRepository.createTicket(ticketData);

            expect(createdTicket).toHaveProperty("id");
            expect(createdTicket.title).toBe(ticketData.title);
            expect(createdTicket.description).toBe(ticketData.description);
            expect(createdTicket.ownerId).toBe(ticketData.ownerId);
            expect(createdTicket.organizationId).toBe(ticketData.organizationId);
            expect(createdTicket.status).toBe(TicketStatusEnum.Open);
            expect(createdTicket.creationDate).toBeInstanceOf(Date);
            expect(createdTicket.updateDate).toBeNull();
        });
    });

    describe("getTicketById", () => {
        it("should retrieve a ticket by its ID", async () => {
            const ticketData: CreatedTicket = {
                title: "Test Ticket",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const createdTicket = await ticketRepository.createTicket(ticketData);
            const foundTicket = await ticketRepository.getTicketById(createdTicket.id);

            expect(foundTicket).toEqual(createdTicket);
        });

        it("should throw an error if the ticket is not found", async () => {
            await expect(ticketRepository.getTicketById(999)).rejects.toThrow("Ticket not found");
        });
    });

    describe("getTicketsByUserId", () => {
        it("should retrieve tickets by user ID and organization ID", async () => {
            const ticketData1: CreatedTicket = {
                title: "Test Ticket 1",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const ticketData2: CreatedTicket = {
                title: "Test Ticket 2",
                description: "This is another test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            await ticketRepository.createTicket(ticketData1);
            await ticketRepository.createTicket(ticketData2);

            const foundTickets = await ticketRepository.getTicketsByUserId(
                "user_123456789012345678901234567",
                "org_123456789012345678901234567",
            );

            expect(foundTickets.length).toBe(2);
            expect(foundTickets[0].title).toBe(ticketData1.title);
            expect(foundTickets[1].title).toBe(ticketData2.title);
        });

        it("should throw an error if the user ID is invalid", async () => {
            await expect(
                ticketRepository.getTicketsByUserId("invalid_user_id", "org_123456789012345678901234567"),
            ).rejects.toThrow("String must contain exactly 32 character(s)");
        });

        it("should throw an error if the organization ID is invalid", async () => {
            await expect(
                ticketRepository.getTicketsByUserId("user_123456789012345678901234567", "invalid_org_id"),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });

    describe("getTicketsByOrganizationId", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });
        it("should retrieve tickets by organization ID", async () => {
            const ticketData1: CreatedTicket = {
                title: "Test Ticket 1",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const ticketData2: CreatedTicket = {
                title: "Test Ticket 2",
                description: "This is another test ticket",
                ownerId: "user_123456789012345678901234568",
                organizationId: "org_123456789012345678901234567",
            };

            await ticketRepository.createTicket(ticketData1);
            await ticketRepository.createTicket(ticketData2);

            const foundTickets = await ticketRepository.getTicketsByOrganizationId(
                "org_123456789012345678901234567",
            );

            expect(foundTickets.length).toBe(2);
            expect(foundTickets[0].title).toBe(ticketData1.title);
            expect(foundTickets[1].title).toBe(ticketData2.title);
        });

        it("should throw an error if the organization ID is invalid", async () => {
            await expect(
                ticketRepository.getTicketsByOrganizationId("invalid_org_id"),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });

    describe("updateTicket", () => {
        it("should update a ticket in the database", async () => {
            const ticketData: CreatedTicket = {
                title: "Test Ticket",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const createdTicket = await ticketRepository.createTicket(ticketData);

            const updatedTicketData: UpdatedTicket = {
                id: createdTicket.id,
                title: "Updated Test Ticket",
                description: "This is an updated test ticket",
                status: TicketStatusEnum.InProgress,
            };

            const updatedTicket = await ticketRepository.updateTicket(updatedTicketData);

            expect(updatedTicket.title).toBe(updatedTicketData.title);
            expect(updatedTicket.description).toBe(updatedTicketData.description);
            expect(updatedTicket.status).toBe(updatedTicketData.status);
        });

        it("should throw an error if the ticket is not found for update", async () => {
            const updatedTicketData: UpdatedTicket = {
                id: 999,
                title: "Updated Test Ticket",
                description: "This is an updated test ticket",
                status: TicketStatusEnum.InProgress,
            };

            await expect(ticketRepository.updateTicket(updatedTicketData)).rejects.toThrow(
                "Ticket not found for update",
            );
        });
    });

    describe("deleteTicket", () => {
        it("should delete a ticket from the database", async () => {
            const ticketData: CreatedTicket = {
                title: "Test Ticket",
                description: "This is a test ticket",
                ownerId: "user_123456789012345678901234567",
                organizationId: "org_123456789012345678901234567",
            };

            const createdTicket = await ticketRepository.createTicket(ticketData);
            await ticketRepository.deleteTicket(createdTicket.id);

            await expect(ticketRepository.getTicketById(createdTicket.id)).rejects.toThrow(
                "Ticket not found",
            );
        });

    });
});