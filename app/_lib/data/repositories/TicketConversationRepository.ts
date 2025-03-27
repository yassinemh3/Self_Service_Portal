import { ITicketConversationRepository } from "@lib/data/interfaces";
import {
    CreatedTicketConversation,
    TicketConversation,
} from "@lib/data/entities";
import { UpdatedTicketConversation } from "@lib/data/entities/TicketConversation";
import {
    CreatedTicketConversationSchema,
    UpdatedTicketConversationSchema,
} from "@lib/data/repoZodSchemas";
import { db, ticketConversation } from "../../../../db";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

export class TicketConversationRepository
    implements ITicketConversationRepository
{
    async createTicketConversation(
        newTicketConversation: CreatedTicketConversation,
    ): Promise<TicketConversation> {
        const parsedTicketConversationData =
            CreatedTicketConversationSchema.safeParse(newTicketConversation);
        if (!parsedTicketConversationData.success) {
            throw new Error(
                parsedTicketConversationData.error.errors[0].message,
            );
        }

        const [createdTicketConversation] = await db
            .insert(ticketConversation)
            .values(parsedTicketConversationData.data)
            .returning();
        return createdTicketConversation;
    }

    async getTicketConversationById(id: number): Promise<TicketConversation> {
        const validId = z.number().int().nonnegative().parse(id);
        if (!validId) {
            throw new Error("Invalid ID");
        }

        const foundTicketConversation = await db
            .select()
            .from(ticketConversation)
            .where(eq(ticketConversation.id, validId));

        if (foundTicketConversation.length === 0) {
            throw new Error("Ticket conversation not found");
        }

        return foundTicketConversation[0];
    }

    async getTicketConversationsByTicketId(
        ticketId: number,
    ): Promise<TicketConversation[]> {
        const validId = z.number().int().nonnegative().parse(ticketId);
        if (!validId) {
            throw new Error("Invalid ID");
        }
        const ticketConversations = await db
            .select()
            .from(ticketConversation)
            .where(eq(ticketConversation.ticketId, validId))
            .orderBy(asc(ticketConversation.creationDate));

        return ticketConversations as TicketConversation[];
    }

    async updateTicketConversation(
        updatedTicketConversation: UpdatedTicketConversation,
    ): Promise<TicketConversation> {
        const parsedTicketConversationData =
            UpdatedTicketConversationSchema.safeParse(
                updatedTicketConversation,
            );

        if (!parsedTicketConversationData.success) {
            throw new Error(
                parsedTicketConversationData.error.errors[0].message,
            );
        }

        const [result] = await db
            .update(ticketConversation)
            .set(parsedTicketConversationData.data)
            .where(
                eq(ticketConversation.id, parsedTicketConversationData.data.id),
            )
            .returning();

        if (!updatedTicketConversation) {
            throw new Error("Ticket conversation not found for update");
        }

        return result;
    }

    async deleteTicketConversation(id: number): Promise<void> {
        const validId = z.number().int().nonnegative().parse(id);

        const deletedCount = await db
            .delete(ticketConversation)
            .where(eq(ticketConversation.id, validId));

        if (!deletedCount) {
            throw new Error("Ticket conversation not found for deletion");
        }
    }

    async getAllTicketConversationsInTicket(
        ticketId: number,
    ): Promise<TicketConversation[]> {
        const validTicketId = z.number().int().nonnegative().parse(ticketId);

        const conversations = await db
            .select()
            .from(ticketConversation)
            .where(eq(ticketConversation.ticketId, validTicketId));

        return conversations as TicketConversation[];
    }
}
