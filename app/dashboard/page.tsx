"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { InventoryChart } from "@/components/inventory-chart"
import { TopItemsChart } from "@/components/top-items-chart"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth-token"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { IconPackage, IconAlertTriangle, IconActivity, IconCircleCheck } from "@tabler/icons-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface DashboardSummary {
	totalItems: number
	lowStockItems: number
	outOfStockItems: number
	totalCheckoutsToday: number
	stockHealth: number
	recentActivities: {
		_id: string
		type: string
		partName: string
		quantity: number
		performedBy: string
		createdAt: string
	}[]
	chartData: { date: string; checkouts: number; restocks?: number }[]
	topItems: { name: string; totalQuantity: number; inventoryId: string | null }[]
}

function InventorySectionCards({ data }: { data: DashboardSummary }) {
	return (
		<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<div className="rounded-lg border bg-card p-4 shadow-sm bg-gradient-to-t from-primary/5 to-card">
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Total Item Inventaris</p>
					<p className="text-2xl font-semibold tabular-nums">
						{data.totalItems}
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex items-center gap-2 font-medium">
						<IconPackage className="size-4 text-blue-500" />
						Item terdaftar di sistem
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-4 shadow-sm bg-gradient-to-t from-primary/5 to-card">
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Stok Menipis & Habis</p>
					<p className="text-2xl font-semibold tabular-nums">
						{data.lowStockItems + data.outOfStockItems}
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex items-center gap-2 font-medium">
						<IconAlertTriangle className="size-4 text-amber-500" />
						{data.outOfStockItems} habis, {data.lowStockItems} hampir habis
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-4 shadow-sm bg-gradient-to-t from-primary/5 to-card">
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">
						Transaksi Hari Ini
					</p>
					<p className="text-2xl font-semibold tabular-nums">
						{data.totalCheckoutsToday}
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex items-center gap-2 font-medium">
						<IconActivity className="size-4 text-purple-500" />
						Aktivitas Checkout / Stock-in
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-4 shadow-sm bg-gradient-to-t from-primary/5 to-card">
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Kesehatan Stok</p>
					<p className="text-2xl font-semibold tabular-nums">
						{data.stockHealth}%
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex items-center gap-2 font-medium">
						<IconCircleCheck className="size-4 text-green-500" />
						Level inventaris optimal
					</div>
				</div>
			</div>
		</div>
	)
}

const MOCK_CHART_DATA = [
	{ date: "2026-06-23", checkouts: 45, restocks: 20 },
	{ date: "2026-06-24", checkouts: 52, restocks: 10 },
	{ date: "2026-06-25", checkouts: 38, restocks: 50 },
	{ date: "2026-06-26", checkouts: 65, restocks: 15 },
	{ date: "2026-06-27", checkouts: 48, restocks: 25 },
	{ date: "2026-06-28", checkouts: 70, restocks: 35 },
	{ date: "2026-06-29", checkouts: 55, restocks: 10 },
]

const MOCK_TOP_ITEMS = [
	{ name: "Terminal V-35", totalQuantity: 1250, inventoryId: "1" },
	{ name: "Kabel 18 AWG", totalQuantity: 980, inventoryId: "2" },
	{ name: "Konektor KS-12", totalQuantity: 850, inventoryId: "3" },
	{ name: "Selongsong Heatshrink", totalQuantity: 720, inventoryId: "4" },
	{ name: "Baut M4", totalQuantity: 530, inventoryId: "5" },
	{ name: "Mur M4", totalQuantity: 490, inventoryId: "6" },
	{ name: "Ring M4", totalQuantity: 410, inventoryId: "7" },
	{ name: "Terminal Block", totalQuantity: 380, inventoryId: "8" },
	{ name: "Kabel Ties", totalQuantity: 310, inventoryId: "9" },
]

export default function DashboardPage() {
	const [summary, setSummary] = useState<DashboardSummary | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchSummary = async () => {
			try {
				const token = await getAuthToken()
				if (!token) return
				
				const response = await fetch(`${API_URL}/api/dashboard/summary`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				
				const data = await response.json()
				if (data.success) {
					setSummary(data.data)
				}
			} catch (error) {
				console.error("Failed to fetch dashboard summary", error)
			} finally {
				setLoading(false)
			}
		}

		fetchSummary()
	}, [])

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							{loading || !summary ? (
								<>
									<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
										{Array.from({ length: 4 }).map((_, i) => (
											<div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
												<div className="flex flex-col gap-2">
													<Skeleton className="h-4 w-32" />
													<Skeleton className="h-8 w-20" />
												</div>
												<div className="mt-4 flex items-center gap-2">
													<Skeleton className="h-4 w-4 rounded-full" />
													<Skeleton className="h-4 w-40" />
												</div>
											</div>
										))}
									</div>
									<div className="px-4 lg:px-6">
										<div className="rounded-lg border bg-card p-6 shadow-sm">
											<Skeleton className="h-5 w-48 mb-2" />
											<Skeleton className="h-4 w-72 mb-6" />
											<Skeleton className="h-[250px] w-full rounded-md" />
										</div>
									</div>
									<div className="px-4 lg:px-6 mt-4">
										<div className="rounded-lg border bg-card p-6 shadow-sm">
											<Skeleton className="h-5 w-48 mb-2" />
											<Skeleton className="h-4 w-72 mb-6" />
											<Skeleton className="h-[350px] w-full rounded-md" />
										</div>
									</div>
									<div className="px-4 lg:px-6 mt-4">
										<Skeleton className="h-6 w-36 mb-4" />
										<div className="rounded-md border">
											<div className="p-4 space-y-3">
												{Array.from({ length: 5 }).map((_, i) => (
													<div key={i} className="flex items-center gap-4">
														<Skeleton className="h-5 w-16 rounded-full" />
														<Skeleton className="h-5 w-32" />
														<Skeleton className="h-5 w-12" />
														<Skeleton className="h-5 w-20" />
														<Skeleton className="h-5 w-28" />
													</div>
												))}
											</div>
										</div>
									</div>
								</>
							) : (
								<>
									<InventorySectionCards data={summary} />
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6 mt-4">
										<InventoryChart data={summary.chartData?.length > 0 ? summary.chartData : MOCK_CHART_DATA} />
										<TopItemsChart data={summary.topItems?.length > 0 ? summary.topItems : MOCK_TOP_ITEMS} />
									</div>
									<div className="px-4 lg:px-6 mt-4">
										<h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
										<div className="rounded-md border">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Tipe</TableHead>
														<TableHead>Part Name</TableHead>
														<TableHead>Kuantitas</TableHead>
														<TableHead>User</TableHead>
														<TableHead>Tanggal</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{summary.recentActivities.length > 0 ? (
														summary.recentActivities.map((activity) => (
															<TableRow key={activity._id}>
																<TableCell>
																	<Badge variant="outline" className={activity.type === 'checkout' ? 'text-blue-500' : 'text-green-500'}>
																		{activity.type}
																	</Badge>
																</TableCell>
																<TableCell className="font-medium">{activity.partName}</TableCell>
																<TableCell>{activity.quantity}</TableCell>
																<TableCell>{activity.performedBy}</TableCell>
																<TableCell>{new Date(activity.createdAt).toLocaleString()}</TableCell>
															</TableRow>
														))
													) : (
														<TableRow>
															<TableCell colSpan={5} className="text-center">Belum ada aktivitas</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
