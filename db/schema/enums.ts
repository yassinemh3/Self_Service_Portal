import { pgEnum } from "drizzle-orm/pg-core";

export const ticketStatus = pgEnum("ticket_status", [
    "Open",
    "Closed",
    "In Progress",
    "On Hold",
]);
export const requestStatus = pgEnum("request_status", [
    "Accepted",
    "Declined",
    "Processing",
]);
export const itemInRequestListStatus = pgEnum("item_in_request_list_status", [
    "Accepted",
    "Declined",
    "Processing",
]);
