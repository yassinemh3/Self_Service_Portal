"use client";

import { ShopItemCategory } from "@lib/data/entities/ShopItemCategory";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import { useRouter } from "next/navigation";

interface EditCategoriesDialogProps {
    shopItemCategories: ShopItemCategory[];
}

export default function CategoriesTable({
    shopItemCategories,
}: EditCategoriesDialogProps) {
    const router = useRouter();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className={"w-2/12"}>ID</TableHead>
                    <TableHead className={"w-10/12"}>Name</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {shopItemCategories.map((category) => {
                    return (
                        <TableRow
                            key={category.id}
                            onClick={() =>
                                router.push(`/admin/categories/${category.id}`)
                            }
                            className="cursor-pointer"
                        >
                            <TableCell className={"py-4"}>
                                {category.id}
                            </TableCell>
                            <TableCell className={"py-4"}>
                                {category.name}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
