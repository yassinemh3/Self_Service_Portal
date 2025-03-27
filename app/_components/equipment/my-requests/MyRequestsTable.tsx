"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import {
    ItemInRequestList,
    ItemInRequestStatusEnum,
    Request,
} from "@lib/data/entities";
import { useRouter } from "next/navigation";
import { formatDate, getBadgeVariant } from "@lib/utils";
import { Badge } from "@components/ui/Badge";

export interface MyRequestsTableProps {
    request: Request;
    items: ItemInRequestList[];
}

export default function MyRequestsTable({
    requests,
}: {
    requests: MyRequestsTableProps[];
}) {
    const router = useRouter();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className={"w-1/12"}>ID</TableHead>
                    <TableHead className={"w-2/12"}>Creation Date</TableHead>
                    <TableHead className={"w-2/12"}>Update Date</TableHead>
                    <TableHead className={"w-2/12"}>Status</TableHead>
                    <TableHead className={"w-1/12"}>Requested Items</TableHead>
                    <TableHead className={"w-1/12"}>Accepted Items</TableHead>
                    <TableHead className={"w-1/12"}>Declined Items</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((request, index) => (
                    <TableRow
                        key={index}
                        onClick={() =>
                            router.push(
                                `/equipment/request/${request.request.id}`,
                            )
                        }
                        className="cursor-pointer"
                    >
                        <TableCell>{request.request.id}</TableCell>
                        <TableCell>
                            {formatDate(request.request.creationDate)}
                        </TableCell>
                        <TableCell>
                            {request.request.updateDate ? (
                                formatDate(request.request.updateDate)
                            ) : (
                                <span className={"text-muted-foreground"}>
                                    -
                                </span>
                            )}
                        </TableCell>
                        <TableCell>
                            <Badge
                                variant={getBadgeVariant(
                                    request.request.status,
                                )}
                            >
                                {request.request.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{request.items.length}</TableCell>
                        <TableCell>
                            {request.items.filter(
                                (item) =>
                                    item.status ===
                                    ItemInRequestStatusEnum.Accepted,
                            ).length > 0 ? (
                                request.items.filter(
                                    (item) =>
                                        item.status ===
                                        ItemInRequestStatusEnum.Accepted,
                                ).length
                            ) : (
                                <span className={"text-muted-foreground"}>
                                    0
                                </span>
                            )}
                        </TableCell>
                        <TableCell>
                            {request.items.filter(
                                (item) =>
                                    item.status ===
                                    ItemInRequestStatusEnum.Declined,
                            ).length > 0 ? (
                                request.items.filter(
                                    (item) =>
                                        item.status ===
                                        ItemInRequestStatusEnum.Declined,
                                ).length
                            ) : (
                                <span className={"text-muted-foreground"}>
                                    0
                                </span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
