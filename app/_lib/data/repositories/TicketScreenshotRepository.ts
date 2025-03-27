import { ITicketScreenshotRepository } from "@lib/data/interfaces";
import {
    TicketScreenshot,
    UpdatedTicketScreenshot,
    CreatedTicketScreenshot,
} from "@lib/data/entities";
import { db, ticketScreenshot } from "../../../../db";
import { eq } from "drizzle-orm";

export class TicketScreenshotRepository implements ITicketScreenshotRepository {
    async createTicketScreenshot(
        newTicketScreenshot: CreatedTicketScreenshot,
    ): Promise<TicketScreenshot> {
        const [createdTicketScreenshot] = await db
            .insert(ticketScreenshot)
            .values(newTicketScreenshot)
            .returning();
        return createdTicketScreenshot as TicketScreenshot;
    }

    async findTicketScreenshotById(id: number): Promise<TicketScreenshot> {
        const foundTicketScreenshot = await db
            .select()
            .from(ticketScreenshot)
            .where(eq(ticketScreenshot.id, id));

        if (foundTicketScreenshot.length === 0) {
            throw new Error("Ticket screenshot not found");
        }
        return foundTicketScreenshot[0] as TicketScreenshot;
    }

    async findTicketScreenshotsByTicketId(
        ticketId: number,
    ): Promise<TicketScreenshot[]> {
        const foundTicketScreenshots = await db
            .select()
            .from(ticketScreenshot)
            .where(eq(ticketScreenshot.ticketId, ticketId));
        return foundTicketScreenshots as TicketScreenshot[];
    }

    async updateTicketScreenshot(
        updatedTicketScreenshot: UpdatedTicketScreenshot,
    ): Promise<void> {
        await db
            .update(ticketScreenshot)
            .set(updatedTicketScreenshot)
            .where(eq(ticketScreenshot.id, ticketScreenshot.id));
    }

    async deleteTicketScreenshot(id: number): Promise<void> {
        const deletedCount = await db
            .delete(ticketScreenshot)
            .where(eq(ticketScreenshot.id, id));

        if (!deletedCount) {
            throw new Error("Ticket screenshot not found for deletion");
        }
    }
}
