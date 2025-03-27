"use client";

import { TicketConversation } from "@lib/data/entities";
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

export interface RecentTicketResponsesProp {
    ticketId: number;
    title: string;
    status: string;
    updateDate: Date;
    lastResponse: TicketConversation;
}

export default function RecentTicketResponses({
    ticketProp,
}: {
    ticketProp: RecentTicketResponsesProp[];
}) {
    const router = useRouter();

    const containerRef = useRef<HTMLTableSectionElement>(null);
    const itemRef = useRef<HTMLTableRowElement>(null);
    const [visibleCount, setVisibleCount] = useState(ticketProp.length);

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
    }, [ticketProp]);

    return (
        <Card className="overflow-y-hidden rounded-xl bg-muted/50">
            <CardHeader className="mb-3 items-center pb-0">
                <CardTitle>Recent Ticket Responses</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
                {ticketProp.length > 0 ? (
                    <div
                        ref={containerRef}
                        className={"h-full overflow-y-hidden"}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Response</TableHead>
                                    <TableHead className={"w-1/12"}>
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className={"h-full overflow-y-hidden"}>
                                {ticketProp
                                    .slice(0, visibleCount)
                                    .map((ticket, index) => {
                                        return (
                                            <TableRow
                                                ref={
                                                    index === 0 ? itemRef : null
                                                }
                                                key={index}
                                                onClick={() =>
                                                    router.push(
                                                        `/support/ticket/${ticket.ticketId}`,
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                <TableCell>
                                                    <div
                                                        className={
                                                            "flex flex-col"
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                "flex flex-row justify-between text-muted-foreground"
                                                            }
                                                        >
                                                            <span>
                                                                From:{" "}
                                                                {ticket.title}
                                                            </span>
                                                            <span>
                                                                {ticket
                                                                    .lastResponse
                                                                    .creationDate
                                                                    ? formatDate(
                                                                          ticket
                                                                              .lastResponse
                                                                              .creationDate,
                                                                      )
                                                                    : "-"}
                                                            </span>
                                                        </div>
                                                        {
                                                            ticket.lastResponse
                                                                .content
                                                        }
                                                    </div>
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
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className={"text-center"}>
                        <h1 className={"m-16 text-muted-foreground"}>
                            No new responses found
                        </h1>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
