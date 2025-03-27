"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/Card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@components/ui/Chart";
import { CartesianGrid, XAxis, BarChart, Bar } from "recharts";
import { RequestAmountChartData } from "@lib/data/useCases/getManagerDashboardChartData";

interface RequestAmountChartProps {
    chartData: RequestAmountChartData[];
}

export default function RequestAmountChart({
    chartData,
}: RequestAmountChartProps) {
    const chartConfig = {
        month: {
            label: "Month",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <Card className="flex flex-col rounded-xl bg-muted/50">
            <CardHeader className="items-center pb-0">
                <CardTitle>Request Histogram</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-hidden">
                <ChartContainer
                    config={chartConfig}
                    className="container mx-auto h-full"
                >
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-month)"
                            radius={10}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
