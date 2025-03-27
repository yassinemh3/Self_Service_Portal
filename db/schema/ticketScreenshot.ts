// db/schema.ts
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { ticket } from "./ticket";

export const ticketScreenshot = pgTable("ticket_screenshot", {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id")
        .notNull()
        .references(() => ticket.id, {
            onUpdate: "cascade",
            onDelete: "cascade",
        }),
    url: varchar("url", { length: 255 }).notNull(),
});
