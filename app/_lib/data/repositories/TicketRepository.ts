import { ITicketRepository } from "../interfaces";
import {
    CreatedTicket,
    Ticket,
    UpdatedTicket,
    TicketStatusEnum,
} from "../entities";
import {
    CreatedTicketSchema,
    UpdatedTicketSchema,
} from "@lib/data/repoZodSchemas";
import { db, ticket } from "../../../../db";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

export class TicketRepository implements ITicketRepository {
    async createTicket(ticketData: CreatedTicket): Promise<Ticket> {
        const parsedTicketData = CreatedTicketSchema.safeParse(ticketData);
        if (!parsedTicketData.success) {
            throw new Error(parsedTicketData.error.errors[0].message);
        }

        const [createdTicket] = await db
            .insert(ticket)
            .values(parsedTicketData.data)
            .returning();
        return createdTicket as Ticket;
    }

    async getTicketById(id: number): Promise<Ticket> {
        const validId = z.number().int().parse(id);
        const foundTicket = await db
            .select()
            .from(ticket)
            .where(eq(ticket.id, validId));

        if (foundTicket.length === 0) {
            throw new Error("Ticket not found");
        }
        return foundTicket[0] as Ticket;
    }

    async getTicketsByUserId(userId: string, orgId: string): Promise<Ticket[]> {
        const validUserId = z
            .string()
            .length(32)
            .startsWith("user_")
            .parse(userId);
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(orgId);

        if (!validUserId) {
            throw new Error("Invalid user ID");
        }
        if (!validOrgId) {
            throw new Error("Invalid organization ID");
        }

        const foundTickets = await db
            .select()
            .from(ticket)
            .where(
                and(
                    eq(ticket.ownerId, validUserId),
                    eq(ticket.organizationId, validOrgId),
                ),
            ).orderBy(sql`CASE status
                WHEN ${TicketStatusEnum.Open} THEN 1
                WHEN ${TicketStatusEnum.InProgress} THEN 2
                WHEN ${TicketStatusEnum.OnHold} THEN 3
                WHEN ${TicketStatusEnum.Closed} THEN 4
                ELSE 5
            END`);
        return foundTickets as Ticket[];
    }

    async getTicketsByOrganizationId(orgId: string): Promise<Ticket[]> {
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(orgId);

        if (!validOrgId) {
            throw new Error("Invalid organization ID");
        }

        const foundTickets = await db
            .select()
            .from(ticket)
            .where(eq(ticket.organizationId, validOrgId))
            .orderBy(sql`CASE status
                WHEN ${TicketStatusEnum.Open} THEN 1
                WHEN ${TicketStatusEnum.InProgress} THEN 2
                WHEN ${TicketStatusEnum.OnHold} THEN 3
                WHEN ${TicketStatusEnum.Closed} THEN 4
                ELSE 5
            END`);
        return foundTickets as Ticket[];
    }

    async updateTicket(ticketData: UpdatedTicket): Promise<Ticket> {
        const parsedTicketData = UpdatedTicketSchema.safeParse(ticketData);
        if (!parsedTicketData.success) {
            throw new Error(parsedTicketData.error.errors[0].message);
        }

        const updatedTicket = await db
            .update(ticket)
            .set(parsedTicketData.data)
            .where(eq(ticket.id, parsedTicketData.data.id))
            .returning();

        if (updatedTicket.length === 0) {
            throw new Error("Ticket not found for update");
        }
        return updatedTicket[0] as Ticket;
    }

    async deleteTicket(id: number): Promise<void> {
        const validId = z.number().int().parse(id);
        try {
            await db.delete(ticket).where(eq(ticket.id, validId));
        } catch {
            throw new Error("Failed to delete ticket");
        }
    }
}
