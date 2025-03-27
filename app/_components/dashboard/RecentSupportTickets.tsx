"use client";

import { Ticket } from "@lib/data/entities";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import { formatDate, getBadgeVariant } from "@lib/utils";
import { Badge } from "@components/ui/Badge";
import { useEffect, useRef, useState } from "react";

export default function RecentSupportTickets({
    supportTickets,
}: {
    supportTickets: Ticket[];
}) {
    const router = useRouter();

    const containerRef = useRef<HTMLTableSectionElement>(null);
    const itemRef = useRef<HTMLTableRowElement>(null);
    const [visibleCount, setVisibleCount] = useState(supportTickets.length);

    const updateVisibleCount = () => {
        if (containerRef.current && itemRef.current) {
            const containerHeight = containerRef.current.clientHeight;
            const itemHeight = itemRef.current.clientHeight + 12;
            const maxItems = Math.floor(containerHeight / itemHeight);
            setVisibleCount(maxItems);
        }
    };

    useEffect(() => {
        updateVisibleCount();
        window.addEventListener("resize", updateVisibleCount);
        return () => {
            window.removeEventListener("resize", updateVisibleCount);
        };
    }, [supportTickets]);

    return (
        <Card className="overflow-y-hidden rounded-xl bg-muted/50">
            <CardHeader className="mb-3 items-center pb-0">
                <CardTitle>Recent Support Tickets</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
                {supportTickets.length > 0 ? (
                    <div
                        ref={containerRef}
                        className={"h-full overflow-y-hidden"}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Updated at</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className={"h-full overflow-y-hidden"}>
                                {supportTickets
                                    .slice(0, visibleCount)
                                    .map((ticket, index) => (
                                        <TableRow
                                            ref={index === 0 ? itemRef : null}
                                            key={ticket.id}
                                            onClick={() =>
                                                router.push(
                                                    `/support/ticket/${ticket.id}`,
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            <TableCell>
                                                {ticket.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getBadgeVariant(
                                                        ticket.status,
                                                    )}
                                                >
                                                    {ticket.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.updateDate
                                                    ? formatDate(
                                                          ticket.updateDate,
                                                      )
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className={"text-center"}>
                        <h1 className={"m-16 text-muted-foreground"}>
                            No new tickets found
                        </h1>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
