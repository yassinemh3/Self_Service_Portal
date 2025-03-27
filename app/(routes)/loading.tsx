"use server";
import { Spinner } from "@components/ui/Spinner";

export default async function PageLoader() {
    return (
        <Spinner
            size={"large"}
            className={"mx-auto mt-24 text-muted-foreground"}
        >
            <span className={"text-muted-foreground"}>Loading...</span>
        </Spinner>
    );
}
