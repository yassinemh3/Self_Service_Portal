import {
    integer,
    pgTable,
    serial,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { shopItem } from "./shopItem";

export const inventory = pgTable("inventory", {
    id: serial("id").primaryKey(),
    ownerId: varchar("owner_id", { length: 32 }).notNull(),
    itemId: integer("item_id")
        .notNull()
        .references(() => shopItem.id),
    purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
    updateDate: timestamp("update_date"),
    status: varchar("status", { length: 32 }).default("OK").notNull(),
});
