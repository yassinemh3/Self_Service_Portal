"use server";

export default async function PageSection({
    children,
    title,
    contentLength,
}: {
    children: React.ReactNode;
    title: string;
    contentLength?: number;
}) {
    return (
        <section>
            <h1 className={"text-center text-3xl font-semibold"}>{title}</h1>
            <div className={"container mx-auto my-10 rounded-lg bg-card p-4"}>
                {contentLength !== undefined ? (
                    contentLength > 0 ? (
                        children
                    ) : (
                        <div className={"text-center"}>
                            <h1 className={"m-16 text-muted-foreground"}>
                                No entries found
                            </h1>
                        </div>
                    )
                ) : (
                    children
                )}
            </div>
        </section>
    );
}
