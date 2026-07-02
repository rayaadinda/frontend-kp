"use client"

import * as React from "react"
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
} from "recharts"

import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart"

import { useIsMobile } from "@/hooks/use-mobile"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const chartConfig = {
	checkouts: {
		label: "Pengambilan",
		color: "var(--chart-2)",
	},
	restocks: {
		label: "Pengisian",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig

export function InventoryChart({ data }: { data?: { date: string; checkouts: number; restocks?: number }[] }) {
	const isMobile = useIsMobile()
	const [timeRange, setTimeRange] = React.useState("30d")
	const [filteredData, setFilteredData] = React.useState(data || [])

	React.useEffect(() => {
		if (data) {
			setFilteredData(data)
		}
	}, [data])

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange("7d")
		}
	}, [isMobile])

	React.useEffect(() => {
		if (!data) return;
		const filtered = data.filter((item) => {
			const date = new Date(item.date)
			const referenceDate = new Date() // Use current date for real data
			let daysToSubtract = 90
			if (timeRange === "30d") {
				daysToSubtract = 30
			} else if (timeRange === "7d") {
				daysToSubtract = 7
			}
			const startDate = new Date(referenceDate)
			startDate.setDate(startDate.getDate() - daysToSubtract)
			return date >= startDate
		})
		setFilteredData(filtered)
	}, [timeRange, data])

	if (!filteredData || filteredData.length === 0) {
		return (
			<Card className="@container/card">
				<CardHeader>
					<CardTitle>Pergerakan Inventaris</CardTitle>
					<CardDescription>Data tidak tersedia</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardTitle>Tren Pergerakan Inventaris</CardTitle>
				<CardDescription>
					<span className="hidden @[540px]/card:block">
						Pengambilan vs. pengisian material dalam periode waktu
					</span>
					<span className="@[540px]/card:hidden">
						Pengambilan vs. Pengisian
					</span>
				</CardDescription>
				<div className="flex justify-end">
					<ToggleGroup
						type="single"
						value={timeRange}
						onValueChange={setTimeRange}
						variant="outline"
						className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
					>
						<ToggleGroupItem value="90d">3 Bulan Terakhir</ToggleGroupItem>
						<ToggleGroupItem value="30d">30 Hari Terakhir</ToggleGroupItem>
						<ToggleGroupItem value="7d">7 Hari Terakhir</ToggleGroupItem>
					</ToggleGroup>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger
							className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
							size="sm"
							aria-label="Pilih jangka waktu"
						>
							<SelectValue placeholder="3 Bulan Terakhir" />
						</SelectTrigger>
						<SelectContent className="rounded-xl">
							<SelectItem value="90d" className="rounded-lg">
								3 Bulan Terakhir
							</SelectItem>
							<SelectItem value="30d" className="rounded-lg">
								30 Hari Terakhir
							</SelectItem>
							<SelectItem value="7d" className="rounded-lg">
								7 Hari Terakhir
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient
								id="checkoutsGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="5%" stopColor="var(--color-checkouts)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-checkouts)" stopOpacity={0.1} />
							</linearGradient>
							<linearGradient
								id="restocksGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="5%" stopColor="var(--color-restocks)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-restocks)" stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(value)
								return date.toLocaleDateString("id-ID", {
									month: "short",
									day: "numeric",
								})
							}}
						/>
						<CartesianGrid vertical={false} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent />}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Area
							type="monotone"
							dataKey="restocks"
							stroke="var(--color-restocks)"
							fillOpacity={1}
							fill="url(#restocksGradient)"
							stackId="1"
						/>
						<Area
							type="monotone"
							dataKey="checkouts"
							stroke="var(--color-checkouts)"
							fillOpacity={1}
							fill="url(#checkoutsGradient)"
							stackId="1"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
