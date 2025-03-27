import {
    index,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { ticketStatus } from "./enums";

export const ticket = pgTable(
    "ticket",
    {
        id: serial("id").primaryKey(),
        title: varchar("title", { length: 100 }).notNull(),
        description: text("description").notNull(),
        status: ticketStatus("status").default("Open").notNull(),
        ownerId: varchar("owner_id", { length: 32 }).notNull(),
        creationDate: timestamp("creation_date").defaultNow().notNull(),
        organizationId: varchar("organization_id", { length: 31 }).notNull(),
        supportId: varchar("support_id", { length: 32 }),
        updateDate: timestamp("update_date"),
    },
    (table) => ({
        idxOwnerId: index("idx_ticket_owner").on(table.ownerId),
        idxOrganizationId: index("idx_ticket_organization").on(
            table.organizationId,
        ),
    }),
);
