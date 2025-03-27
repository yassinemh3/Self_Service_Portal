import { db, ticket } from "../../../../db";
import { eq, count, sql } from "drizzle-orm";
import { z } from "zod";

export type TicketStatusChartData = {
    status: "Open" | "Closed" | "In Progress" | "On Hold";
    count: number;
    fill: string;
};

export async function getTicketStatusChartData(
    orgId: string,
): Promise<TicketStatusChartData[]> {
    const validOrgId = z.string().length(31).startsWith("org_").parse(orgId);

    const ticketCounts = await db
        .select({
            status: ticket.status,
            count: count(ticket.status),
        })
        .from(ticket)
        .where(eq(ticket.organizationId, validOrgId))
        .groupBy(ticket.status);

    return ticketCounts.map((data) => {
        let fill;
        switch (data.status) {
            case "Open":
                fill = "var(--color-open)";
                break;
            case "Closed":
                fill = "var(--color-closed)";
                break;
            case "In Progress":
                fill = "var(--color-inProgress)";
                break;
            case "On Hold":
                fill = "var(--color-onHold)";
                break;
        }
        return { ...data, fill };
    });
}

export type TicketAmountChartData = {
    month: string;
    count: number;
};

export async function getTicketAmountChartData(
    orgId: string,
): Promise<TicketAmountChartData[]> {
    const validOrgId = z.string().length(31).startsWith("org_").parse(orgId);

    const ticketCounts = await db
        .select({
            month: sql`TO_CHAR(${ticket.creationDate}, 'YYYY-MM')`.as("month"),
            count: sql`COUNT(${ticket.id})`.as("count"),
        })
        .from(ticket)
        .where(eq(ticket.organizationId, validOrgId))
        .groupBy(sql`TO_CHAR(${ticket.creationDate}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${ticket.creationDate}, 'YYYY-MM')`);

    return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(new Date().getFullYear(), i);
        const formattedMonth = date.toLocaleString("en-US", {
            month: "short",
            year: "2-digit",
        });
        const monthData = ticketCounts.find(
            (data) => new Date(data.month as string).getMonth() === i,
        );
        return {
            month: formattedMonth,
            count: monthData ? Number(monthData.count) : 0,
        };
    });
}
