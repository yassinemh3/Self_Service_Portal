"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";

import {
    ItemInRequestList,
    ItemInRequestStatusEnum,
    Request,
} from "@lib/data/entities";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import { Badge } from "@components/ui/Badge";
import { formatDate, getBadgeVariant } from "@lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MyRecentEquipmentRequestStatusProps {
    request: Request;
    items: ItemInRequestList[];
}
export default function MyRecentEquipmentRequestStatus({
    requestData,
}: {
    requestData: MyRecentEquipmentRequestStatusProps[];
}) {
    const router = useRouter();

    const containerRef = useRef<HTMLTableSectionElement>(null);
    const itemRef = useRef<HTMLTableRowElement>(null);
    const [visibleCount, setVisibleCount] = useState(requestData.length);

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
    }, [requestData]);

    return (
        <Card className="overflow-y-hidden rounded-xl bg-muted/50">
            <CardHeader className="mb-3 items-center pb-0">
                <CardTitle>My Equipment Requests</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
                {requestData.length > 0 ? (
                    <div
                        ref={containerRef}
                        className={"h-full overflow-y-hidden"}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={"w-2/12"}>
                                        Update Date
                                    </TableHead>
                                    <TableHead className={"w-2/12"}>
                                        Status
                                    </TableHead>
                                    <TableHead className={"w-1/12"}>
                                        Requested Items
                                    </TableHead>
                                    <TableHead className={"w-1/12"}>
                                        Accepted Items
                                    </TableHead>
                                    <TableHead className={"w-1/12"}>
                                        Declined Items
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className={"h-full overflow-y-hidden"}>
                                {requestData
                                    .slice(0, visibleCount)
                                    .map((request, index) => (
                                        <TableRow
                                            ref={index === 0 ? itemRef : null}
                                            key={index}
                                            onClick={() =>
                                                router.push(
                                                    `/equipment/request/${request.request.id}`,
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            <TableCell>
                                                {request.request.updateDate ? (
                                                    formatDate(
                                                        request.request
                                                            .creationDate,
                                                    )
                                                ) : (
                                                    <span
                                                        className={
                                                            "text-muted-foreground"
                                                        }
                                                    >
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
                                            <TableCell>
                                                {request.items.length}
                                            </TableCell>
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
                                                    <span
                                                        className={
                                                            "text-muted-foreground"
                                                        }
                                                    >
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
                                                    <span
                                                        className={
                                                            "text-muted-foreground"
                                                        }
                                                    >
                                                        0
                                                    </span>
                                                )}
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
