import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const shopItemCategory = pgTable("shop_item_category", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 32 }).notNull(),
    organizationId: varchar("organization_id", { length: 31 }).notNull(),
});
