"use server";

import { auth } from "@clerk/nextjs/server";
import AddCategoriesForm from "@components/admin/AddCategoriesForm";
import { notFound } from "next/navigation";

export default async function AddCategoriesPage() {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    if (!has({ role: "org:admin" })) {
        notFound();
    }

    return <AddCategoriesForm />;
}
