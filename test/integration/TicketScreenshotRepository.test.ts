import { TicketScreenshotRepository } from "@lib/data/repositories/TicketScreenshotRepository";
import {db, ticket, ticketScreenshot} from "../../db";
import { eq } from "drizzle-orm";

describe("TicketScreenshotRepository Integration Tests", () => {
    let repository: TicketScreenshotRepository;

    beforeAll(async () => {
        // Initialize the repository
        repository = new TicketScreenshotRepository();

        // Ensure the database is clean before running tests
        await db.delete(ticket);
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await db.delete(ticket);
    });
    const ticket1 = {
        id:101,
        title: "Test Ticket",
        description: "This is a test ticket",
        ownerId: "user_123456789012345678901234567",
        organizationId: "org_123456789012345678901234567",
    };
    const mockTicketScreenshot = {
        id: 1,
        ticketId: ticket1.id,
        url: "https://example.com/screenshot.png",
    };
    describe("createTicketScreenshot", () => {
        afterAll(async () => {
            await db.delete(ticket);
        });
        it("should create a new ticket screenshot", async () => {
            await db.insert(ticket).values(ticket1);
            const result = await repository.createTicketScreenshot(
                mockTicketScreenshot,
            );

            expect(result).toHaveProperty("id");
            expect(result.ticketId).toEqual(mockTicketScreenshot.ticketId);
            expect(result.url).toEqual(mockTicketScreenshot.url);

            // Verify the data was inserted into the database
            const [insertedScreenshot] = await db
                .select()
                .from(ticketScreenshot)
                .where(eq(ticketScreenshot.id, result.id));
            expect(insertedScreenshot).toEqual(result);
        });
    });

    describe("findTicketScreenshotById", () => {
        beforeEach(async () => {
            await db.delete(ticket);
            await db.delete(ticketScreenshot);

        });

        it("should retrieve a ticket screenshot by ID", async () => {
            // Insert test data
            await db.insert(ticket).values(ticket1);
            const [insertedScreenshot] = await db
                .insert(ticketScreenshot)
                .values(mockTicketScreenshot)
                .returning();

            const result = await repository.findTicketScreenshotById(
                insertedScreenshot.id,
            );

            // Assert the result
            expect(result).toEqual(insertedScreenshot);
        });

        it("should throw an error if ticket screenshot is not found by ID", async () => {
            await expect(
                repository.findTicketScreenshotById(999),
            ).rejects.toThrow("Ticket screenshot not found");
        });
    });

    describe("findTicketScreenshotsByTicketId", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });
        it("should retrieve all ticket screenshots by Ticket ID", async () => {
            // Insert test data
            const testScreenshots = [
                {
                    ticketId: 101,
                    url: "https://example.com/screenshot1.png",
                },
                {
                    ticketId: 101,
                    url: "https://example.com/screenshot2.png",
                },
            ];
            await db.insert(ticket).values(ticket1);
            await db.insert(ticketScreenshot).values(testScreenshots);

            const result = await repository.findTicketScreenshotsByTicketId(101);

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].ticketId).toEqual(101);
            expect(result[1].ticketId).toEqual(101);
        });

        it("should return an empty array if no screenshots are found", async () => {
            const result = await repository.findTicketScreenshotsByTicketId(999);
            expect(result).toEqual([]);
        });
    });

    describe("updateTicketScreenshot", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });

        it("should update a ticket screenshot", async () => {
            // Insert test data
            await db.insert(ticket).values(ticket1);
            const [insertedScreenshot] = await db
                .insert(ticketScreenshot)
                .values(mockTicketScreenshot)
                .returning();

            // Update the screenshot
            const updateData = {
                id: insertedScreenshot.id,
                url: "https://example.com/new_screenshot.png",
            };

            await repository.updateTicketScreenshot(updateData);

            // Verify the update in the database
            const [updatedScreenshot] = await db
                .select()
                .from(ticketScreenshot)
                .where(eq(ticketScreenshot.id, insertedScreenshot.id));
            expect(updatedScreenshot.url).toEqual(updateData.url);
        });

    });

    describe("deleteTicketScreenshot", () => {
        beforeEach(async () => {
            await db.delete(ticket);
        });

        it("should delete a ticket screenshot", async () => {
            // Insert test data
            await db.insert(ticket).values(ticket1);
            const [insertedScreenshot] = await db
                .insert(ticketScreenshot)
                .values(mockTicketScreenshot)
                .returning();

            // Call the repository method
            await repository.deleteTicketScreenshot(insertedScreenshot.id);

            // Verify the deletion
            const [deletedScreenshot] = await db
                .select()
                .from(ticketScreenshot)
                .where(eq(ticketScreenshot.id, insertedScreenshot.id));
            expect(deletedScreenshot).toBeUndefined();
        });

    });
});