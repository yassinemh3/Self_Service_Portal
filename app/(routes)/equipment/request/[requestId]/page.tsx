"use server";

import { auth } from "@clerk/nextjs/server";
import {
    itemInRequestRepository,
    requestRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { fetchUserData, formatDate, getBadgeVariant } from "@lib/utils";
import { Clock4, RotateCw } from "lucide-react";
import { notFound } from "next/navigation";
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
import ChangeEquipmentRequestStatusForm from "@components/equipment/request/ChangeEquipmentRequestStatusForm";

export default async function RequestPage({
    params,
}: {
    params: Promise<{ requestId: string }>;
}) {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    const requestId = (await params).requestId;
    const request = await requestRepository.getRequestById(parseInt(requestId));

    const canSeeAllRequests =
        has({ permission: "org:requests:manage_all" }) &&
        has({ permission: "org:requests:view_all" });

    const canSeeRequest = userId === request.userId || canSeeAllRequests;

    const itemsInRequest = await itemInRequestRepository.getItemsInRequestList(
        parseInt(requestId),
    );

    if (!canSeeRequest) {
        notFound();
    }

    const shopItems =
        await shopItemRepository.getAllShopItemsInOrganization(orgId);

    const userData = await fetchUserData(request.userId);

    return (
        <>
            <Card className={"container mx-auto mb-16"}>
                <CardHeader>
                    <div className={"flex flex-row justify-between"}>
                        <div className={"space-y-4"}>
                            <CardTitle>Request #{request.id}</CardTitle>
                            <div
                                className={
                                    "flex flex-row items-center justify-start space-x-12 text-sm"
                                }
                            >
                                <CardDescription
                                    className={"flex flex-row items-center"}
                                >
                                    <Badge
                                        variant={getBadgeVariant(
                                            request.status,
                                        )}
                                        className={"size-fit"}
                                    >
                                        {request.status}
                                    </Badge>
                                </CardDescription>
                                <CardDescription>
                                    <span className={"flex items-center"}>
                                        <Clock4 className={"mr-2 h-4 w-4"} />
                                        <p>
                                            {formatDate(request.creationDate)}
                                        </p>
                                    </span>
                                </CardDescription>
                                <CardDescription>
                                    <span className={"flex items-center"}>
                                        <RotateCw className={"mr-2 h-4 w-4"} />
                                        <p>
                                            {request.updateDate
                                                ? formatDate(request.updateDate)
                                                : "-"}
                                        </p>
                                    </span>
                                </CardDescription>
                                <CardDescription
                                    className={"flex items-center gap-x-2"}
                                >
                                    <p>
                                        By:{" "}
                                        {userData?.first_name +
                                            " " +
                                            userData?.last_name || "Unknown"}
                                    </p>
                                    {userData?.image_url ? (
                                        <Image
                                            src={userData.image_url}
                                            alt={
                                                userData?.first_name +
                                                " " +
                                                userData?.last_name +
                                                "image"
                                            }
                                            height={36}
                                            width={36}
                                            className={"h-9 w-9 rounded-lg"}
                                        />
                                    ) : (
                                        <Skeleton className="h-9 w-9 content-center items-center rounded-lg text-center">
                                            <div>NA</div>
                                        </Skeleton>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        {canSeeAllRequests && (
                            <ChangeEquipmentRequestStatusForm
                                requestId={requestId}
                            />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={"w-1/12"}>
                                    Image
                                </TableHead>
                                <TableHead className={"w-1/12"}>Name</TableHead>
                                <TableHead className={"w-1/12"}>
                                    Quantity
                                </TableHead>
                                <TableHead className={"w-1/12"}>
                                    Stock
                                </TableHead>
                                <TableHead className={"w-1/12"}>
                                    Status
                                </TableHead>
                                {canSeeAllRequests && (
                                    <TableHead className={"w-1/12"}>
                                        Change Status
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itemsInRequest.map((item) => {
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell
                                            className={
                                                "flex w-fit flex-row text-center"
                                            }
                                        >
                                            {shopItems.find(
                                                (shopItem) =>
                                                    shopItem.id === item.itemId,
                                            )?.url ? (
                                                <Image
                                                    className={
                                                        "h-12 w-12 rounded-lg bg-gray-400 object-cover"
                                                    }
                                                    src={
                                                        shopItems.find(
                                                            (shopItem) =>
                                                                shopItem.id ===
                                                                item.itemId,
                                                        )?.url || ""
                                                    }
                                                    alt={
                                                        shopItems.find(
                                                            (shopItem) =>
                                                                shopItem.id ===
                                                                item.itemId,
                                                        )?.name || ""
                                                    }
                                                    width={48}
                                                    height={48}
                                                />
                                            ) : (
                                                <Skeleton className="h-24 w-24 content-center rounded-lg bg-background text-center">
                                                    <div>No Image</div>
                                                </Skeleton>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {
                                                shopItems.find(
                                                    (shopItem) =>
                                                        shopItem.id ===
                                                        item.itemId,
                                                )?.name
                                            }
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            {
                                                shopItems.find(
                                                    (shopItem) =>
                                                        shopItem.id ===
                                                        item.itemId,
                                                )?.stock
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getBadgeVariant(
                                                    item.status,
                                                )}
                                                className={"size-fit"}
                                            >
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        {canSeeAllRequests && (
                                            <TableCell>
                                                <ChangeEquipmentRequestStatusForm
                                                    requestId={requestId}
                                                    itemInRequestId={String(
                                                        item.id,
                                                    )}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
