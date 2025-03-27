import {
    index,
    pgTable,
    serial,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { requestStatus } from "./enums";

export const request = pgTable(
    "request",
    {
        id: serial("id").primaryKey(),
        userId: varchar("user_id", { length: 32 }).notNull(),
        status: requestStatus("status").default("Processing").notNull(),
        creationDate: timestamp("creation_date").defaultNow().notNull(),
        organizationId: varchar("organization_id", { length: 31 }).notNull(),
        updateDate: timestamp("update_date"),
    },
    (table) => ({
        idxUserId: index("idx_request_user").on(table.userId),
        idxOrganizationId: index("idx_request_organization").on(
            table.organizationId,
        ),
    }),
);
