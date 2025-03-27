"use client";

import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@components/ui/Chart";
import { TicketStatusChartData } from "@lib/data/useCases/getSupportDashboardChartData";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/Card";
import { Label, Pie, PieChart } from "recharts";
import { useMemo } from "react";

interface TicketChartProps {
    chartData: TicketStatusChartData[];
}
export default function TicketStatusChart({ chartData }: TicketChartProps) {
    const chartConfig = {
        count: {
            label: "Tickets",
        },
        open: {
            label: "Open",
            color: "hsl(var(--chart-1))",
        },
        closed: {
            label: "Closed",
            color: "hsl(var(--chart-2))",
        },
        inProgress: {
            label: "In Progress",
            color: "hsl(var(--chart-4))",
        },
        onHold: {
            label: "On Hold",
            color: "hsl(var(--chart-5))",
        },
    } satisfies ChartConfig;

    const totalTickets = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.count, 0);
    }, [chartData]);

    return (
        <Card className="flex flex-col rounded-xl bg-muted/50">
            <CardHeader className="items-center px-0 pb-0">
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Overview of ticket statuses</CardDescription>
            </CardHeader>
            <CardContent className="aspect-video flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalTickets.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Tickets
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey={"status"} />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
