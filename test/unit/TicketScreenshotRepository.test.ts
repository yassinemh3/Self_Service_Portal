import { TicketScreenshotRepository } from "@lib/data/repositories/TicketScreenshotRepository";
import { db, ticketScreenshot } from "../../db";

jest.mock("../../db", () => ({
    db: {
        insert: jest.fn(),
        select: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    ticketScreenshot: {
        id: expect.any(Number),
        ticketId: expect.any(Number),
        url: expect.any(String),
    },
}));

describe("TicketScreenshotRepository", () => {
    let repository: TicketScreenshotRepository;

    beforeEach(() => {
        repository = new TicketScreenshotRepository();
        jest.clearAllMocks();
    });

    const mockTicketScreenshot = {
        id: 1,
        ticketId: 101,
        url: "https://example.com/screenshot.png",
    };

    it("should create a new ticket screenshot", async () => {
        (db.insert as jest.Mock).mockReturnValue({
            values: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([mockTicketScreenshot]),
            }),
        });

        const result =
            await repository.createTicketScreenshot(mockTicketScreenshot);

        expect(result).toEqual(mockTicketScreenshot);
        expect(db.insert).toHaveBeenCalledWith(ticketScreenshot);
        expect(db.insert(ticketScreenshot).values).toHaveBeenCalledWith(
            mockTicketScreenshot,
        );
    });

    it("should retrieve a ticket screenshot by ID", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([mockTicketScreenshot]),
            }),
        });

        const result = await repository.findTicketScreenshotById(1);

        expect(result).toEqual(mockTicketScreenshot);
        expect(db.select).toHaveBeenCalled();
    });

    it("should throw an error if ticket screenshot is not found by ID", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            }),
        });

        await expect(repository.findTicketScreenshotById(999)).rejects.toThrow(
            "Ticket screenshot not found",
        );
    });

    it("should retrieve all ticket screenshots by Ticket ID", async () => {
        (db.select as jest.Mock).mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([mockTicketScreenshot]),
            }),
        });

        const result = await repository.findTicketScreenshotsByTicketId(101);

        expect(result).toEqual([mockTicketScreenshot]);
        expect(db.select).toHaveBeenCalled();
    });

    it("should update a ticket screenshot", async () => {
        const updatedMock = {
            ...mockTicketScreenshot,
            url: "https://example.com/new_screenshot.png",
        };

        (db.update as jest.Mock).mockReturnValue({
            set: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue(1),
            }),
        });

        await expect(
            repository.updateTicketScreenshot(updatedMock),
        ).resolves.not.toThrow();
        expect(db.update).toHaveBeenCalled();
    });

    it("should delete a ticket screenshot", async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockResolvedValue(1),
        });

        await expect(
            repository.deleteTicketScreenshot(1),
        ).resolves.not.toThrow();
        expect(db.delete).toHaveBeenCalled();
    });

    it("should throw an error when trying to delete a non-existing ticket screenshot", async () => {
        (db.delete as jest.Mock).mockReturnValue({
            where: jest.fn().mockResolvedValue(0),
        });

        await expect(repository.deleteTicketScreenshot(999)).rejects.toThrow(
            "Ticket screenshot not found for deletion",
        );
    });
});
