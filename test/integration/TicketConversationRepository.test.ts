import { TicketConversationRepository } from "@lib/data/repositories/TicketConversationRepository";
import {db, ticket, ticketConversation} from "../../db";
import { eq } from "drizzle-orm";

describe("TicketConversationRepository Integration Tests", () => {
    let repository: TicketConversationRepository;

    beforeAll(async () => {
        // Initialize the repository
        repository = new TicketConversationRepository();
        // Ensure the database is clean before running tests
        await db.delete(ticket);
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await db.delete(ticket);
    });
    const ticket1 = {
        id: 101,
        title: "Test Ticket 1",
        description: "This is a test ticket",
        ownerId: "user_123456789012345678901234567",
        organizationId: "org_123456789012345678901234567",
    };

    const mockTicketConversation = {
        id: 1,
        ticketId: ticket1.id,
        userId: "user_123456789012345678901234567",
        content: "Test conversation content",
        creationDate: new Date(),
    };

    describe("createTicketConversation", () => {
        it("should create a new ticket conversation", async () => {
            await db.insert(ticket).values(ticket1);
            const result = await repository.createTicketConversation({
                ticketId: mockTicketConversation.ticketId,
                userId: mockTicketConversation.userId,
                content: mockTicketConversation.content,
            });

            expect(result).toHaveProperty("id");
            expect(result.ticketId).toEqual(mockTicketConversation.ticketId);
            expect(result.userId).toEqual(mockTicketConversation.userId);
            expect(result.content).toEqual(mockTicketConversation.content);
        });
    });

    describe("getTicketConversationById", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(ticket);
        });
        it("should retrieve a ticket conversation by ID", async () => {
            // Insert test data
            await db.insert(ticket).values(ticket1);
            const [insertedConversation] = await db
                .insert(ticketConversation)
                .values(mockTicketConversation)
                .returning();

            // Call the repository method
            const result = await repository.getTicketConversationById(
                insertedConversation.id,
            );

            // Assert the result
            expect(result).toEqual(insertedConversation);
        });

        it("should throw an error if ticket conversation is not found by ID", async () => {
            await expect(
                repository.getTicketConversationById(999),
            ).rejects.toThrow("Ticket conversation not found");
        });
    });

    describe("getTicketConversationsByTicketId", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });

        it("should retrieve all ticket conversations by Ticket ID", async () => {
            // Insert test data
            const testConversations = [
                {
                    ticketId: 101,
                    userId: "user_123456789012345678901234567",
                    content: "Test conversation 1",
                    creationDate: new Date(),
                },
                {
                    ticketId: 101,
                    userId: "user_123456789012345678901234567",
                    content: "Test conversation 2",
                    creationDate: new Date(),
                },
            ];
            await db.insert(ticket).values(ticket1);
            await db.insert(ticketConversation).values(testConversations);

            // Call the repository method
            const result = await repository.getTicketConversationsByTicketId(101);

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].ticketId).toEqual(101);
            expect(result[1].ticketId).toEqual(101);
        });
    });

    describe("updateTicketConversation", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });

        it("should update a ticket conversation", async () => {
            // Insert test data
            await db.insert(ticket).values(ticket1);
            const [insertedConversation] = await db
                .insert(ticketConversation)
                .values(mockTicketConversation)
                .returning();

            // Update the conversation
            const updateData = {
                id: insertedConversation.id,
                content: "Updated content",
            };
            const result = await repository.updateTicketConversation(updateData);

            // Assert the result
            expect(result.content).toEqual(updateData.content);

            // Verify the update in the database
            const [updatedConversation] = await db
                .select()
                .from(ticketConversation)
                .where(eq(ticketConversation.id, insertedConversation.id));
            expect(updatedConversation.content).toEqual(updateData.content);
        });

    });

    describe("deleteTicketConversation", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });

        it("should delete a ticket conversation", async () => {
            // Insert test data
            await db.insert(ticket).values(ticket1);
            const [insertedConversation] = await db
                .insert(ticketConversation)
                .values(mockTicketConversation)
                .returning();

            // Call the repository method
            await repository.deleteTicketConversation(insertedConversation.id);

            // Verify the deletion
            const [deletedConversation] = await db
                .select()
                .from(ticketConversation)
                .where(eq(ticketConversation.id, insertedConversation.id));
            expect(deletedConversation).toBeUndefined();
        });

    });

    describe("getAllTicketConversationsInTicket", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });

        it("should retrieve all ticket conversations in a ticket", async () => {
            // Insert test data
            const testConversations = [
                {
                    ticketId: 101,
                    userId: "user_123456789012345678901234567",
                    content: "Test conversation 1",
                    creationDate: new Date(),
                },
                {
                    ticketId: 101,
                    userId: "user_123456789012345678901234567",
                    content: "Test conversation 2",
                    creationDate: new Date(),
                },
            ];
            await db.insert(ticket).values(ticket1);
            await db.insert(ticketConversation).values(testConversations);

            // Call the repository method
            const result = await repository.getAllTicketConversationsInTicket(101);

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].ticketId).toEqual(101);
            expect(result[1].ticketId).toEqual(101);
        });
    });
});