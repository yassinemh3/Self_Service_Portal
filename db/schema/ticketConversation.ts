import {
    index,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { ticket } from "./ticket";

export const ticketConversation = pgTable(
    "ticket_conversation",
    {
        id: serial("id").primaryKey(),
        ticketId: integer("ticket_id")
            .notNull()
            .references(() => ticket.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        userId: varchar("user_id", { length: 32 }).notNull(),
        content: text("content").notNull(),
        creationDate: timestamp("creation_date").defaultNow().notNull(),
    },
    (table) => ({
        idxTicketId: index("idx_ticket_conversation_ticket").on(table.ticketId),
    }),
);
