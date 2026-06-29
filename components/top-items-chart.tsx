"use client"

import { useMemo } from "react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
} from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
	totalQuantity: {
		label: "Total Quantity",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig

interface TopItemsChartProps {
	data: { name: string; totalQuantity: number; inventoryId: string | null }[]
}

export function TopItemsChart({ data }: TopItemsChartProps) {
	// Sort data by totalQuantity descending and take top 10
	const sortedData = useMemo(() => {
		if (!data || !Array.isArray(data)) return []
		return [...data].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10)
	}, [data])

	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Top 10 Barang Paling Sering Diambil</CardTitle>
					<CardDescription>Dalam 30 hari terakhir</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
						Belum ada data pengambilan barang
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top 10 Barang Paling Sering Diambil</CardTitle>
				<CardDescription>Berdasarkan jumlah kuantitas yang diambil dalam 30 hari terakhir</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[350px] w-full">
					<BarChart data={sortedData} layout="vertical" margin={{ left: 0, right: 20 }}>
						<CartesianGrid horizontal={false} />
						<XAxis type="number" tickLine={false} axisLine={false} />
						<YAxis
							type="category"
							dataKey="name"
							width={120}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => {
								return value.length > 15 ? value.substring(0, 15) + "..." : value;
							}}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						<Bar dataKey="totalQuantity" fill="var(--color-totalQuantity)" radius={[0, 4, 4, 0]} barSize={24} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
