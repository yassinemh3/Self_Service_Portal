"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import { Ticket } from "@lib/data/entities";
import { Badge } from "@components/ui/Badge";
import { formatDate, getBadgeVariant } from "@lib/utils";
import { useRouter } from "next/navigation";

export interface MyTicketsTableProps {
    tickets: Ticket[];
}

export default function MyTicketsTable({ tickets }: MyTicketsTableProps) {
    const router = useRouter();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tickets.length === 0 ? (
                    <TableRow>
                        <TableCell
                            className="h-24 content-center text-center"
                            colSpan={5}
                        >
                            No tickets found. Have you submitted one yet?
                        </TableCell>
                    </TableRow>
                ) : (
                    tickets.map((ticket: Ticket) => (
                        <TableRow
                            className="hover:cursor-pointer"
                            key={ticket.id + 1}
                            onClick={() =>
                                router.push(`/support/ticket/${ticket.id}`)
                            }
                        >
                            <TableCell>{ticket.id}</TableCell>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>
                                <Badge variant={getBadgeVariant(ticket.status)}>
                                    {ticket.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {formatDate(ticket.creationDate)}
                            </TableCell>
                            <TableCell>
                                {ticket.updateDate
                                    ? formatDate(ticket.updateDate)
                                    : "-"}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
