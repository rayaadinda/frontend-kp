"use client"

import * as React from "react"
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts"

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

// Data pergerakan inventaris (pengambilan vs pengisian)
const inventoryChartData = [
	{ date: "2024-04-01", checkouts: 120, restocks: 50 },
	{ date: "2024-04-05", checkouts: 85, restocks: 120 },
	{ date: "2024-04-10", checkouts: 150, restocks: 80 },
	{ date: "2024-04-15", checkouts: 90, restocks: 180 },
	{ date: "2024-04-20", checkouts: 120, restocks: 70 },
	{ date: "2024-04-25", checkouts: 180, restocks: 200 },
	{ date: "2024-04-30", checkouts: 110, restocks: 90 },
	{ date: "2024-05-05", checkouts: 140, restocks: 160 },
	{ date: "2024-05-10", checkouts: 190, restocks: 100 },
	{ date: "2024-05-15", checkouts: 160, restocks: 180 },
	{ date: "2024-05-20", checkouts: 130, restocks: 90 },
	{ date: "2024-05-25", checkouts: 170, restocks: 210 },
	{ date: "2024-05-30", checkouts: 150, restocks: 130 },
	{ date: "2024-06-05", checkouts: 200, restocks: 180 },
	{ date: "2024-06-10", checkouts: 170, restocks: 120 },
	{ date: "2024-06-15", checkouts: 190, restocks: 220 },
	{ date: "2024-06-20", checkouts: 210, restocks: 150 },
	{ date: "2024-06-25", checkouts: 180, restocks: 210 },
	{ date: "2024-06-30", checkouts: 230, restocks: 190 },
]

export function InventoryChart() {
	const isMobile = useIsMobile()
	const [timeRange, setTimeRange] = React.useState("90d")
	const [filteredData, setFilteredData] = React.useState(inventoryChartData)

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange("7d")
		}
	}, [isMobile])

	React.useEffect(() => {
		const filtered = inventoryChartData.filter((item) => {
			const date = new Date(item.date)
			const referenceDate = new Date("2024-06-30")
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
	}, [timeRange])

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
				<div className="h-[250px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={filteredData}>
							<defs>
								<linearGradient
									id="checkoutsGradient"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient
									id="restocksGradient"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<XAxis
								dataKey="date"
								tickFormatter={(tick) => {
									const date = new Date(tick)
									return `${date.getDate()}/${date.getMonth() + 1}`
								}}
								stroke="#888"
								fontSize={12}
							/>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#e5e7eb"
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "white",
									borderRadius: "0.5rem",
									border: "1px solid #e5e7eb",
									boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
								}}
								formatter={(value, name) => {
									return [
										`${value} unit`,
										name === "checkouts" ? "Pengambilan" : "Pengisian",
									]
								}}
								labelFormatter={(label) => {
									const date = new Date(label)
									return date.toLocaleDateString("id-ID", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})
								}}
							/>
							<Legend
								formatter={(value) => {
									return value === "checkouts" ? "Pengambilan" : "Pengisian"
								}}
							/>
							<Area
								type="monotone"
								dataKey="checkouts"
								stroke="#3b82f6"
								fillOpacity={1}
								fill="url(#checkoutsGradient)"
								name="checkouts"
								stackId="1"
							/>
							<Area
								type="monotone"
								dataKey="restocks"
								stroke="#10b981"
								fillOpacity={1}
								fill="url(#restocksGradient)"
								name="restocks"
								stackId="2"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}
