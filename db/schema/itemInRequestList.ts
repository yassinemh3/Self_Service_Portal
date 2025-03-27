import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { request } from "./request";
import { shopItem } from "./shopItem";
import { itemInRequestListStatus } from "./enums";

export const itemInRequestList = pgTable(
    "item_in_request_list",
    {
        id: serial("id").primaryKey(),
        requestId: integer("request_id")
            .notNull()
            .references(() => request.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        itemId: integer("item_id")
            .notNull()
            .references(() => shopItem.id, {
                onUpdate: "cascade",
                onDelete: "cascade",
            }),
        quantity: integer("quantity").notNull(),
        organizationId: varchar("organization_id", { length: 31 }).notNull(),
        status: itemInRequestListStatus("status")
            .default("Processing")
            .notNull(),
    },
    (table) => ({
        idxRequestId: index("idx_item_request").on(table.requestId),
        idxOrganizationId: index("idx_item_organization").on(
            table.organizationId,
        ),
    }),
);
