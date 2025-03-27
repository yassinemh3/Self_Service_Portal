"use server";

import { TicketConversation } from "@lib/data/entities";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/Card";
import { formatDate } from "@lib/utils";
import { fetchUserData } from "@lib/utils";
import Image from "next/image";

export default async function ConversationCard({
    content,
    creationDate,
    userId,
}: TicketConversation) {
    const userData = await fetchUserData(userId);

    return (
        <Card className={"container mx-auto my-8"}>
            <CardHeader>
                <CardTitle className={"flex flex-row items-center"}>
                    <Image
                        src={userData.image_url}
                        alt={
                            userData.first_name +
                            " " +
                            userData.last_name +
                            " profile picture"
                        }
                        width={32}
                        height={32}
                        className={"mr-4 rounded-lg"}
                    />
                    {userData.first_name} {userData.last_name}
                </CardTitle>
            </CardHeader>
            <CardContent className={""}>{content}</CardContent>
            <CardFooter>
                <CardDescription>{formatDate(creationDate)}</CardDescription>
            </CardFooter>
        </Card>
    );
}
