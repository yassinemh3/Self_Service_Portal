import { db, request } from "../../../../db";
import { eq, count, sql } from "drizzle-orm";
import { z } from "zod";

export type RequestsStatusChartData = {
    status: "Accepted" | "Declined" | "Processing";
    count: number;
    fill: string;
};

export async function getRequestsStatusChartData(
    orgId: string,
): Promise<RequestsStatusChartData[]> {
    const validOrgId = z.string().length(31).startsWith("org_").parse(orgId);

    const requestCounts = await db
        .select({
            status: request.status,
            count: count(request.status),
        })
        .from(request)
        .where(eq(request.organizationId, validOrgId))
        .groupBy(request.status);

    return requestCounts.map((data) => {
        let fill;
        switch (data.status) {
            case "Accepted":
                fill = "hsl(var(--chart-2))";
                break;
            case "Declined":
                fill = "hsl(var(--chart-5))";
                break;
            case "Processing":
                fill = "hsl(var(--chart-1))";
                break;
        }
        return { ...data, fill };
    });
}

export type RequestAmountChartData = {
    month: string;
    count: number;
};

export async function getRequestAmountChartData(
    orgId: string,
): Promise<RequestAmountChartData[]> {
    const validOrgId = z.string().length(31).startsWith("org_").parse(orgId);

    const requestCounts = await db
        .select({
            month: sql`TO_CHAR(${request.creationDate}, 'YYYY-MM')`.as("month"),
            count: sql`COUNT(${request.id})`.as("count"),
        })
        .from(request)
        .where(eq(request.organizationId, validOrgId))
        .groupBy(sql`TO_CHAR(${request.creationDate}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${request.creationDate}, 'YYYY-MM')`);

    return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(new Date().getFullYear(), i);
        const formattedMonth = date.toLocaleString("en-US", {
            month: "short",
            year: "2-digit",
        });
        const monthData = requestCounts.find(
            (data) => new Date(data.month as string).getMonth() === i,
        );
        return {
            month: formattedMonth,
            count: monthData ? Number(monthData.count) : 0,
        };
    });
}
