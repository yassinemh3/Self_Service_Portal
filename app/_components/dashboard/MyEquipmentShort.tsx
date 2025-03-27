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
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import { useEffect, useRef, useState } from "react";

export interface MyEquipmentShortProp {
    imageUrl: string;
    name: string;
    description: string;
    purchaseDate: Date;
}

export default function MyEquipmentShort({
    equipmentProps,
}: {
    equipmentProps: MyEquipmentShortProp[];
}) {
    const containerRef = useRef<HTMLTableSectionElement>(null);
    const itemRef = useRef<HTMLTableRowElement>(null);
    const [visibleCount, setVisibleCount] = useState(equipmentProps.length);

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
    }, [equipmentProps]);

    return (
        <Card className="overflow-y-hidden rounded-xl bg-muted/50">
            <CardHeader className="mb-3 items-center pb-0">
                <CardTitle>My Equipment</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
                {equipmentProps.length > 0 ? (
                    <div
                        ref={containerRef}
                        className={"h-full overflow-y-hidden"}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className={"w-1/12"}>
                                        Image
                                    </TableHead>
                                    <TableHead className={"w-1/12"}>
                                        Name
                                    </TableHead>
                                    <TableHead className={"w-5/12"}>
                                        Description
                                    </TableHead>
                                    <TableHead className={"w-1/12"}>
                                        Purchase Date
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equipmentProps
                                    .slice(0, visibleCount)
                                    .map((equipmentProp, index) => (
                                        <TableRow
                                            ref={index === 0 ? itemRef : null}
                                            key={index}
                                        >
                                            <TableCell className={"w-1/12"}>
                                                {equipmentProp.imageUrl ? (
                                                    <Image
                                                        src={
                                                            equipmentProp.imageUrl
                                                        }
                                                        alt={equipmentProp.name}
                                                        className={
                                                            "h-16 w-16 content-center rounded-lg bg-background text-center"
                                                        }
                                                        width={64}
                                                        height={64}
                                                    />
                                                ) : (
                                                    <Skeleton className="h-16 w-16 content-center rounded-lg bg-background text-center">
                                                        <div>No Image</div>
                                                    </Skeleton>
                                                )}
                                            </TableCell>
                                            <TableCell className={"w-2/12"}>
                                                {equipmentProp.name}
                                            </TableCell>
                                            <TableCell className={"w-2/12"}>
                                                {equipmentProp.description}
                                            </TableCell>
                                            <TableCell className={"w-2/12"}>
                                                {equipmentProp.purchaseDate.toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className={"text-center"}>
                        <h1 className={"m-16 text-muted-foreground"}>
                            No new equipment found
                        </h1>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
