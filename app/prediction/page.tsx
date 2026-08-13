"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useMemo, useState } from "react"
import { getAuthToken } from "@/lib/auth-token"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
	IconBrain,
	IconChartDots,
	IconLoader2,
	IconFlame,
	IconGauge,
	IconSnowflake,
	IconAlertTriangle,
	IconTrendingUp,
	IconPackage,
	IconArrowUp,
} from "@tabler/icons-react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	XAxis,
	YAxis,
	PieChart,
	Pie,
} from "recharts"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || "http://localhost:8000"

interface ClusterResult {
	id: string
	inventory?: {
		partNumber: string
		partName: string
		quantity: number
	}
	itemName: string
	frekuensiTransaksi: number
	totalPenggunaan: number
	jumlahHariAktif: number
	jumlahWorkOrder: number
	clusterIndex: number
	clusterLabel: string
}

interface AnalysisRun {
	id: string
	analysisDate: string
	periodeAwal: string
	periodeAkhir: string
	totalItems: number
	jumlahCluster: number
	metode: string
	silhouetteScore: number
	dbiScore: number
	results: ClusterResult[]
	createdBy?: { username: string }
}

// — Color config per cluster label using shadcn chart CSS variables —
const CLUSTER_CONFIG: Record<string, { color: string; chartKey: string; bgColor: string; borderColor: string; textColor: string; icon: typeof IconFlame; badgeBg: string; label: string; rekomendasiSingkat: string; rekomendasiDetail: string }> = {
	"Fast Moving": {
		color: "var(--chart-1)",
		chartKey: "fast",
		bgColor: "bg-chart-1/10",
		borderColor: "border-chart-1/30",
		textColor: "text-chart-1",
		icon: IconFlame,
		badgeBg: "bg-chart-1 text-white",
		label: "Fast Moving",
		rekomendasiSingkat: "PRIORITAS RESTOCK",
		rekomendasiDetail: "Barang ini sering digunakan. Pastikan stok selalu tersedia dan lakukan pemesanan ulang segera sebelum habis.",
	},
	"Medium Moving": {
		color: "var(--chart-4)",
		chartKey: "medium",
		bgColor: "bg-chart-4/10",
		borderColor: "border-chart-4/30",
		textColor: "text-chart-4",
		icon: IconGauge,
		badgeBg: "bg-chart-4 text-white",
		label: "Medium Moving",
		rekomendasiSingkat: "RESTOCK BERKALA",
		rekomendasiDetail: "Barang dengan pergerakan sedang. Lakukan pemesanan ulang secara berkala sesuai jadwal normal.",
	},
	"Slow Moving": {
		color: "var(--chart-2)",
		chartKey: "slow",
		bgColor: "bg-chart-2/10",
		borderColor: "border-chart-2/30",
		textColor: "text-chart-2",
		icon: IconSnowflake,
		badgeBg: "bg-chart-2 text-white",
		label: "Slow Moving",
		rekomendasiSingkat: "EVALUASI PEMBELIAN",
		rekomendasiDetail: "Barang jarang digunakan. Kurangi jumlah pembelian untuk menghindari dead stock dan penumpukan di gudang.",
	},
}

// shadcn ChartConfig for bar chart
const barChartConfig = {
	jumlah: { label: "Jumlah Item" },
	fast: { label: "Fast Moving", color: "var(--chart-1)" },
	medium: { label: "Medium Moving", color: "var(--chart-4)" },
	slow: { label: "Slow Moving", color: "var(--chart-2)" },
} satisfies ChartConfig

// shadcn ChartConfig for pie chart
const pieChartConfig = {
	value: { label: "Item" },
	fast: { label: "Fast Moving", color: "var(--chart-1)" },
	medium: { label: "Medium Moving", color: "var(--chart-4)" },
	slow: { label: "Slow Moving", color: "var(--chart-2)" },
} satisfies ChartConfig

function getClusterConfig(label: string) {
	return CLUSTER_CONFIG[label] || CLUSTER_CONFIG["Slow Moving"]
}

// — Skeleton Loading Component —
function PredictionSkeleton() {
	return (
		<div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<Skeleton className="h-10 w-44" />
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-8 w-16" />
						</div>
						<div className="mt-3">
							<Skeleton className="h-4 w-full" />
						</div>
					</div>
				))}
			</div>

			{/* Tabs Skeleton */}
			<Skeleton className="h-10 w-72" />

			{/* Priority Cards Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="rounded-lg border bg-card p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-4">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="space-y-1.5 flex-1">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-3 w-20" />
							</div>
						</div>
						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, j) => (
								<Skeleton key={j} className="h-4 w-full" />
							))}
						</div>
					</div>
				))}
			</div>

			{/* Table Skeleton */}
			<div className="rounded-lg border bg-card p-6">
				<Skeleton className="h-6 w-48 mb-4" />
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="flex items-center gap-4">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-40 flex-1" />
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-20 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default function PredictionPage() {
	const [latestRun, setLatestRun] = useState<AnalysisRun | null>(null)
	const [loading, setLoading] = useState(true)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const { data: session } = useSession()
	const isAdmin = session?.user?.role === "admin"

	const fetchLatestRun = async () => {
		try {
			setLoading(true)
			const token = await getAuthToken()
			if (!token) return

			const response = await fetch(`${API_URL}/api/analytics/latest`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			
			const data = await response.json()
			if (data.success && data.data) {
				setLatestRun(data.data)
			}
		} catch (error) {
			console.error("Failed to fetch latest analysis", error)
			toast.error("Gagal mengambil data riwayat analisis.")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchLatestRun()
	}, [])

	const handleRunClustering = async () => {
		try {
			setIsAnalyzing(true)
			toast.info("Menjalankan algoritma K-Means...", { duration: 3000 })
			
			const token = await getAuthToken()
			if (!token) throw new Error("Unauthorized")

			// Menggunakan rentang data yang lebih luas untuk development
			const currentDate = new Date();
			const payload = {
				start_date: "2023-01-01T00:00:00Z",
				end_date: currentDate.toISOString(),
				n_clusters: 3
			}

			const response = await fetch(`${ANALYTICS_URL}/api/clustering/run`, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload)
			})

			const data = await response.json()
			
			if (!response.ok) {
				throw new Error(data.detail || "Terjadi kesalahan pada Analytics Service")
			}

			toast.success("Analisis K-Means berhasil dijalankan!")
			fetchLatestRun() // Refresh data
		} catch (error: unknown) {
			console.error(error)
			const errorMessage = error instanceof Error ? error.message : "Gagal menjalankan analisis"
			toast.error(errorMessage)
		} finally {
			setIsAnalyzing(false)
		}
	}

	// — Computed data from analysis results —
	const clusterSummary = useMemo(() => {
		if (!latestRun) return []
		const groups: Record<string, ClusterResult[]> = {}
		for (const r of latestRun.results) {
			if (!groups[r.clusterLabel]) groups[r.clusterLabel] = []
			groups[r.clusterLabel].push(r)
		}
		// Sort: Fast > Medium > Slow
		const order = ["Fast Moving", "Medium Moving", "Slow Moving"]
		return order.filter(label => groups[label]).map(label => ({
			label,
			items: groups[label],
			count: groups[label].length,
			config: getClusterConfig(label),
		}))
	}, [latestRun])

	const chartData = useMemo(() => {
		return clusterSummary.map(cluster => ({
			name: cluster.label,
			jumlah: cluster.count,
			fill: cluster.config.color,
		}))
	}, [clusterSummary])

	const pieData = useMemo(() => {
		return clusterSummary.map(cluster => ({
			name: cluster.label,
			value: cluster.count,
			fill: cluster.config.color,
		}))
	}, [clusterSummary])

	// Fast moving items sorted by totalPenggunaan desc, take top 5
	const priorityRestockItems = useMemo(() => {
		if (!latestRun) return []
		return latestRun.results
			.filter(r => r.clusterLabel === "Fast Moving")
			.sort((a, b) => b.totalPenggunaan - a.totalPenggunaan)
	}, [latestRun])

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
					{loading ? (
						<PredictionSkeleton />
					) : !latestRun ? (
						<div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
							{/* Header */}
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-2xl font-semibold tracking-tight">Prediksi Kebutuhan Stok</h1>
									<p className="text-muted-foreground">
										Analisis K-Means untuk klasifikasi pergerakan barang
									</p>
								</div>
								{isAdmin && (
									<Button onClick={handleRunClustering} disabled={isAnalyzing} size="lg">
										{isAnalyzing ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconBrain className="mr-2 h-4 w-4" />}
										Jalankan K-Means
									</Button>
								)}
							</div>

							<Card className="border-dashed">
								<CardContent className="flex flex-col items-center justify-center h-80 text-center">
									<div className="rounded-full bg-muted p-6 mb-6">
										<IconChartDots className="h-12 w-12 text-muted-foreground" />
									</div>
									<h3 className="text-xl font-semibold">Belum Ada Data Analisis</h3>
									<p className="text-muted-foreground mt-2 max-w-md">
										Anda belum pernah menjalankan analisis K-Means. Klik tombol <strong>&quot;Jalankan K-Means&quot;</strong> di atas untuk memulai proses klasifikasi dan prediksi kebutuhan stok barang.
									</p>
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
							{/* Header */}
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h1 className="text-2xl font-semibold tracking-tight">Prediksi Kebutuhan Stok</h1>
									<p className="text-muted-foreground">
										Hasil analisis K-Means terakhir — {new Date(latestRun.analysisDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
									</p>
								</div>
								{isAdmin && (
									<Button onClick={handleRunClustering} disabled={isAnalyzing} size="lg">
										{isAnalyzing ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconBrain className="mr-2 h-4 w-4" />}
										Jalankan Ulang K-Means
									</Button>
								)}
							</div>

							{/* — Ringkasan Statistik — */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								<Card className="p-4 gap-3 shadow-sm rounded-lg border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
											<IconPackage className="w-4 h-4 text-slate-600 dark:text-slate-300" />
										</div>
										<div className="text-sm font-medium text-muted-foreground">Total Item Dianalisis</div>
									</div>
									<div className="flex flex-col gap-2 mt-1">
										<div className="text-2xl font-medium tracking-tight leading-none">
											{latestRun.totalItems}
										</div>
										<p className="text-[11px] text-muted-foreground font-medium">
											{new Date(latestRun.periodeAwal).toLocaleDateString("id-ID", { month: "short", year: "numeric" })} – {new Date(latestRun.periodeAkhir).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
										</p>
									</div>
								</Card>

								<Card className="p-4 gap-3 shadow-sm rounded-lg border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
											<IconChartDots className="w-4 h-4 text-slate-600 dark:text-slate-300" />
										</div>
										<div className="text-sm font-medium text-muted-foreground">Jumlah Cluster (K)</div>
									</div>
									<div className="flex flex-col gap-2 mt-1">
										<div className="text-2xl font-medium tracking-tight leading-none">
											{latestRun.jumlahCluster}
										</div>
										<p className="text-[11px] text-muted-foreground font-medium">Metode: {latestRun.metode}</p>
									</div>
								</Card>

								<Card className="p-4 gap-3 shadow-sm rounded-lg border-green-500/20 bg-green-500/5 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-950">
											<IconGauge className="w-4 h-4 text-green-600 dark:text-green-500" />
										</div>
										<div className="text-sm font-medium text-green-700 dark:text-green-400">Silhouette Score</div>
									</div>
									<div className="flex flex-col gap-2 mt-1">
										<div className="text-2xl font-medium tracking-tight leading-none text-green-600">
											{latestRun.silhouetteScore?.toFixed(4)}
										</div>
										<p className="text-[11px] text-green-700/60 dark:text-green-400/60 font-medium">Mendekati 1 = Sangat baik</p>
									</div>
								</Card>

								<Card className="p-4 gap-3 shadow-sm rounded-lg border-blue-500/20 bg-blue-500/5 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950">
											<IconBrain className="w-4 h-4 text-blue-600 dark:text-blue-500" />
										</div>
										<div className="text-sm font-medium text-blue-700 dark:text-blue-400">Davies-Bouldin Index</div>
									</div>
									<div className="flex flex-col gap-2 mt-1">
										<div className="text-2xl font-medium tracking-tight leading-none text-blue-600">
											{latestRun.dbiScore?.toFixed(4)}
										</div>
										<p className="text-[11px] text-blue-700/60 dark:text-blue-400/60 font-medium">Mendekati 0 = Sangat baik</p>
									</div>
								</Card>
							</div>

							{/* — Tabs: Ringkasan / Detail — */}
							<Tabs defaultValue="ringkasan" className="w-full">
								<TabsList>
									<TabsTrigger value="ringkasan">Ringkasan & Rekomendasi</TabsTrigger>
									<TabsTrigger value="detail">Detail Semua Item</TabsTrigger>
								</TabsList>

								{/* — TAB 1: Ringkasan — */}
								<TabsContent value="ringkasan" className="flex flex-col gap-6 mt-4">
									{/* Distribusi Cluster + Pie Chart */}
									<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
										{/* Bar Chart */}
										<Card className="lg:col-span-2">
											<CardHeader>
												<CardTitle>Distribusi Cluster</CardTitle>
												<CardDescription>
													Jumlah item per kategori pergerakan berdasarkan hasil K-Means
												</CardDescription>
											</CardHeader>
											<CardContent>
												<ChartContainer config={barChartConfig} className="h-[220px] w-full">
													<BarChart data={chartData} layout="vertical" accessibilityLayer margin={{ left: 20 }}>
														<CartesianGrid horizontal={false} />
														<XAxis type="number" tickLine={false} axisLine={false} />
														<YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} tickMargin={8} />
														<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
														<Bar dataKey="jumlah" radius={[0, 6, 6, 0]} barSize={32} />
													</BarChart>
												</ChartContainer>
											</CardContent>
										</Card>

										{/* Pie Chart */}
										<Card>
											<CardHeader>
												<CardTitle>Proporsi</CardTitle>
												<CardDescription>Komposisi cluster item</CardDescription>
											</CardHeader>
											<CardContent className="flex flex-col items-center">
												<ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[180px]">
													<PieChart>
														<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
														<Pie
															data={pieData}
															nameKey="name"
															dataKey="value"
															innerRadius={45}
															outerRadius={75}
															strokeWidth={2}
															stroke="hsl(var(--background))"
														>
															<Label
																content={({ viewBox }) => {
																	if (viewBox && "cx" in viewBox && "cy" in viewBox) {
																		return (
																			<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
																				<tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-medium">
																					{latestRun?.totalItems}
																				</tspan>
																				<tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
																					Total Item
																				</tspan>
																			</text>
																		)
																	}
																}}
															/>
														</Pie>
													</PieChart>
												</ChartContainer>
												{/* Legend */}
												<div className="flex flex-col gap-2 mt-2 w-full">
													{clusterSummary.map((cluster) => (
														<div key={cluster.label} className="flex items-center justify-between text-sm">
															<div className="flex items-center gap-2">
																<div className="size-3 rounded-full" style={{ backgroundColor: cluster.config.color }} />
																<span>{cluster.label}</span>
															</div>
															<span className="font-semibold">{cluster.count} item</span>
														</div>
													))}
												</div>
											</CardContent>
										</Card>
									</div>

									{/* — Rekomendasi per Cluster — */}
									<div>
										<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
											<IconTrendingUp className="h-5 w-5" />
											Rekomendasi Berdasarkan Cluster
										</h2>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											{clusterSummary.map((cluster) => {
												const Icon = cluster.config.icon
												return (
													<Card key={cluster.label} className={`${cluster.config.bgColor} ${cluster.config.borderColor} border`}>
														<CardHeader className="pb-3">
															<div className="flex items-center gap-3">
																<div className={`rounded-full p-2.5 ${cluster.config.badgeBg}`}>
																	<Icon className="h-5 w-5" />
																</div>
																<div>
																	<CardTitle className="text-base">{cluster.label}</CardTitle>
																	<CardDescription className={`font-semibold text-xs uppercase tracking-wider ${cluster.config.textColor}`}>
																		{cluster.config.rekomendasiSingkat}
																	</CardDescription>
																</div>
															</div>
														</CardHeader>
														<CardContent className="space-y-3">
															<p className="text-sm text-muted-foreground leading-relaxed">
																{cluster.config.rekomendasiDetail}
															</p>
															<div className="text-sm font-medium">
																{cluster.count} item termasuk dalam kategori ini
															</div>
														</CardContent>
													</Card>
												)
											})}
										</div>
									</div>

									{/* — Prioritas Restock (Fast Moving Items) — */}
									{priorityRestockItems.length > 0 && (
										<Card className="border-red-200 dark:border-red-800">
											<CardHeader>
												<div className="flex items-center gap-2">
													<IconAlertTriangle className="h-5 w-5 text-red-500" />
													<CardTitle className="text-red-700 dark:text-red-400">
														Daftar Prioritas Restock — Fast Moving
													</CardTitle>
												</div>
												<CardDescription>
													Barang-barang ini harus <strong>diprioritaskan pemesanan ulangnya</strong> karena tingkat penggunaan yang tinggi.
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="rounded-md border">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead className="w-12">#</TableHead>
																<TableHead>Part Number</TableHead>
																<TableHead>Nama Barang</TableHead>
																<TableHead className="text-right">Frekuensi</TableHead>
																<TableHead className="text-right bg-blue-50/50 dark:bg-blue-950/20">Prediksi Kebutuhan</TableHead>
																<TableHead className="text-right">Sisa Stok</TableHead>
																<TableHead className="text-right bg-green-50/50 dark:bg-green-950/20">Rekomendasi Order</TableHead>
																<TableHead>Status</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{priorityRestockItems.map((item, idx) => {
																const qty = item.inventory?.quantity ?? 0
																const isLow = qty <= 10
																const isOut = qty === 0
																
																// Hitung prediksi kebutuhan
																let multiplier = 1.0;
																if (item.clusterLabel === "Fast Moving") multiplier = 1.2;
																else if (item.clusterLabel === "Medium Moving") multiplier = 1.1;
																
																const prediksiKebutuhan = Math.ceil(item.totalPenggunaan * multiplier);
																const rekomendasiOrder = Math.max(0, prediksiKebutuhan - qty);

																return (
																	<TableRow key={item.id} className={isOut ? "bg-red-50/50 dark:bg-red-950/20" : isLow ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
																		<TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
																		<TableCell className="font-mono text-sm font-medium">{item.inventory?.partNumber || "-"}</TableCell>
																		<TableCell className="font-medium">{item.itemName}</TableCell>
																		<TableCell className="text-right">{item.frekuensiTransaksi}x</TableCell>
																		<TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10">{prediksiKebutuhan.toLocaleString("id-ID")}</TableCell>
																		<TableCell className="text-right font-medium">
																			{qty}
																		</TableCell>
																		<TableCell className="text-right font-semibold text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-950/10">
																			{rekomendasiOrder > 0 ? `+${rekomendasiOrder.toLocaleString("id-ID")}` : "0"}
																		</TableCell>
																		<TableCell>
																			{isOut ? (
																				<Badge variant="destructive" className="gap-1">
																					<IconArrowUp className="h-3 w-3 rotate-180" />
																					HABIS
																				</Badge>
																			) : isLow ? (
																				<Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
																					<IconAlertTriangle className="h-3 w-3" />
																					MENIPIS
																				</Badge>
																			) : (
																				<Badge variant="secondary" className="gap-1">
																					<IconPackage className="h-3 w-3" />
																					AMAN
																				</Badge>
																			)}
																		</TableCell>
																	</TableRow>
																)
															})}
														</TableBody>
													</Table>
												</div>
											</CardContent>
										</Card>
									)}
								</TabsContent>

								{/* — TAB 2: Detail Semua Item — */}
								<TabsContent value="detail" className="mt-4">
									<Card>
										<CardHeader>
											<CardTitle>Detail Hasil Clustering Semua Item</CardTitle>
											<CardDescription>
												Daftar lengkap seluruh part number dan hasil klasifikasi K-Means (K={latestRun.jumlahCluster})
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="rounded-md border">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Part Number</TableHead>
															<TableHead>Nama Barang</TableHead>
															<TableHead className="text-right">Frekuensi</TableHead>
															<TableHead className="text-right">Total Pakai</TableHead>
															<TableHead className="text-right bg-blue-50/50 dark:bg-blue-950/20">Prediksi Kebutuhan</TableHead>
															<TableHead className="text-right">Stok Aktual</TableHead>
															<TableHead className="text-right bg-green-50/50 dark:bg-green-950/20">Rekomendasi Order</TableHead>
															<TableHead>Cluster</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{latestRun.results
															.sort((a, b) => {
																// Sort by cluster: Fast first, then Medium, then Slow
																const order = ["Fast Moving", "Medium Moving", "Slow Moving"]
																return order.indexOf(a.clusterLabel) - order.indexOf(b.clusterLabel)
															})
															.map((item) => {
															const config = getClusterConfig(item.clusterLabel)
															const qty = item.inventory?.quantity || 0;
															
															// Hitung prediksi kebutuhan
															let multiplier = 1.0;
															if (item.clusterLabel === "Fast Moving") multiplier = 1.2;
															else if (item.clusterLabel === "Medium Moving") multiplier = 1.1;
															
															const prediksiKebutuhan = Math.ceil(item.totalPenggunaan * multiplier);
															const rekomendasiOrder = Math.max(0, prediksiKebutuhan - qty);

															return (
																<TableRow key={item.id}>
																	<TableCell className="font-mono text-sm font-medium">{item.inventory?.partNumber || "-"}</TableCell>
																	<TableCell className="font-medium">{item.itemName}</TableCell>
																	<TableCell className="text-right">{item.frekuensiTransaksi}</TableCell>
																	<TableCell className="text-right">{item.totalPenggunaan.toLocaleString("id-ID")}</TableCell>
																	<TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10">{prediksiKebutuhan.toLocaleString("id-ID")}</TableCell>
																	<TableCell className="text-right font-semibold">{qty}</TableCell>
																	<TableCell className="text-right font-semibold text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-950/10">
																		{rekomendasiOrder > 0 ? `+${rekomendasiOrder.toLocaleString("id-ID")}` : "0"}
																	</TableCell>
																	<TableCell>
																		<Badge className={config.badgeBg}>
																			{item.clusterLabel}
																		</Badge>
																	</TableCell>
																</TableRow>
															)
														})}
													</TableBody>
												</Table>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
