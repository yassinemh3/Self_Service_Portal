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
import { formatDate } from "@lib/utils";

export interface MyEquipmentTableProp {
    imageUrl: string;
    name: string;
    description: string;
    purchaseDate: Date;
    status: string;
}

export default function MyEquipmentTable({
    equipmentProps,
}: {
    equipmentProps: MyEquipmentTableProp[];
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className={"w-1/12"}>Image</TableHead>
                    <TableHead className={"w-1/12"}>Name</TableHead>
                    <TableHead className={"w-3/12"}>Description</TableHead>
                    <TableHead className={"w-1/12"}>Purchase Date</TableHead>
                    <TableHead className={"w-1/12"}>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {equipmentProps.map((equipmentProp, index) => (
                    <TableRow key={index}>
                        <TableCell className={"w-1/12"}>
                            {equipmentProp.imageUrl ? (
                                <Image
                                    src={equipmentProp.imageUrl}
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
                            {formatDate(equipmentProp.purchaseDate)}
                        </TableCell>
                        <TableCell className={"w-2/12"}>
                            {equipmentProp.status}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
