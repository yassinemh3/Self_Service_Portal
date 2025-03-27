"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import Image from "next/image";
import { Skeleton } from "@components/ui/Skeleton";
import { RequestStatusEnum } from "@lib/data/entities";
import { formatDate, getBadgeVariant } from "@lib/utils";
import { Badge } from "@components/ui/Badge";
import { useRouter } from "next/navigation";

export interface AllRequestsTableProp {
    requestId: number;
    userImageUrl: string;
    userFullName: string;
    creationDate: Date;
    updateDate: Date | undefined;
    status: RequestStatusEnum;
    requestedItemsAmount: number;
    acceptedItemsAmount: number;
    declinedItemsAmount: number;
}

export default function AllRequestsTable({
    requestProps,
}: {
    requestProps: AllRequestsTableProp[];
}) {
    const router = useRouter();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Creation Date</TableHead>
                    <TableHead>Update Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested Items</TableHead>
                    <TableHead>Accepted Items</TableHead>
                    <TableHead>Declined Items</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requestProps.map((requestProp, index) => {
                    return (
                        <TableRow
                            key={index}
                            onClick={() =>
                                router.push(
                                    `/equipment/request/${requestProp.requestId}`,
                                )
                            }
                            className="cursor-pointer"
                        >
                            <TableCell>
                                {requestProp.userImageUrl ? (
                                    <Image
                                        src={requestProp.userImageUrl}
                                        alt={requestProp.userFullName}
                                        className={
                                            "h-12 w-12 content-center rounded-lg bg-background text-center"
                                        }
                                        width={64}
                                        height={64}
                                    />
                                ) : (
                                    <Skeleton className="h-12 w-12 content-center rounded-lg bg-background text-center">
                                        <div>NA</div>
                                    </Skeleton>
                                )}
                            </TableCell>
                            <TableCell>{requestProp.userFullName}</TableCell>
                            <TableCell>
                                {formatDate(requestProp.creationDate)}
                            </TableCell>
                            <TableCell>
                                {requestProp.updateDate
                                    ? formatDate(requestProp.updateDate)
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={getBadgeVariant(
                                        requestProp.status,
                                    )}
                                >
                                    {requestProp.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {requestProp.requestedItemsAmount}
                            </TableCell>
                            <TableCell>
                                {requestProp.acceptedItemsAmount}
                            </TableCell>
                            <TableCell>
                                {requestProp.declinedItemsAmount}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
