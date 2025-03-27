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
import { formatDate, getBadgeVariant } from "@lib/utils";
import { Badge } from "@components/ui/Badge";
import { useRouter } from "next/navigation";

export interface AllTicketsTableProps {
    tickets: Ticket[];
}

export default function AllTicketsTable({ tickets }: AllTicketsTableProps) {
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
                {tickets.map((ticket) => (
                    <TableRow
                        key={ticket.id}
                        onClick={() =>
                            router.push(`/support/ticket/${ticket.id}`)
                        }
                        className="cursor-pointer"
                    >
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                            <Badge variant={getBadgeVariant(ticket.status)}>
                                {ticket.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ticket.creationDate)}</TableCell>
                        <TableCell>
                            {ticket.updateDate
                                ? formatDate(ticket.updateDate)
                                : "-"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
