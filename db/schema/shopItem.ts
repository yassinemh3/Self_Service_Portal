import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { shopItemCategory } from "./shopItemCategory";

export const shopItem = pgTable(
    "shop_item",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        description: varchar("description", { length: 255 }),
        url: varchar("url", { length: 255 }),
        categoryId: integer("category_id").references(
            () => shopItemCategory.id,
        ),
        stock: integer("stock").notNull(),
        organizationId: varchar("organization_id", { length: 31 }).notNull(),
    },
    (table) => ({
        idxOrganizationId: index("idx_shop_item_organization").on(
            table.organizationId,
        ),
    }),
);
