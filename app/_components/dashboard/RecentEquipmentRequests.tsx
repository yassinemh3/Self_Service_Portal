"use client";

import { ItemInRequestList, Request } from "@lib/data/entities";
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

interface RecentEquipmentRequestsProps {
    request: Request;
    items: ItemInRequestList[];
    userFullName: string;
}

export default function RecentEquipmentRequests({
    equipmentRequestsWithItems,
}: {
    equipmentRequestsWithItems: RecentEquipmentRequestsProps[];
}) {
    const router = useRouter();

    const containerRef = useRef<HTMLTableSectionElement>(null);
    const itemRef = useRef<HTMLTableRowElement>(null);
    const [visibleCount, setVisibleCount] = useState(
        equipmentRequestsWithItems.length,
    );

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
    }, [equipmentRequestsWithItems]);

    return (
        <Card className="overflow-hidden rounded-xl bg-muted/50">
            <CardHeader className="mb-3 items-center pb-0">
                <CardTitle>Recent Equipment Requests</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
                {equipmentRequestsWithItems.length > 0 ? (
                    <div
                        ref={containerRef}
                        className={"h-full overflow-y-hidden"}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Creation at</TableHead>
                                    <TableHead>Updated at</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested Items</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className={"h-full overflow-y-hidden"}>
                                {equipmentRequestsWithItems
                                    .slice(0, visibleCount)
                                    .map((request, index) => (
                                        <TableRow
                                            ref={index === 0 ? itemRef : null}
                                            key={request.request.id}
                                            onClick={() =>
                                                router.push(
                                                    `/equipment/request/${request.request.id}`,
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            <TableCell>
                                                {request.userFullName}
                                            </TableCell>
                                            <TableCell>
                                                {request.request.creationDate
                                                    ? formatDate(
                                                          request.request
                                                              .creationDate,
                                                      )
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {request.request.updateDate
                                                    ? formatDate(
                                                          request.request
                                                              .updateDate,
                                                      )
                                                    : "-"}
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
                                            <TableCell>
                                                {request.items.length}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className={"text-center"}>
                        <h1 className={"m-16 text-muted-foreground"}>
                            No new requests found
                        </h1>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
