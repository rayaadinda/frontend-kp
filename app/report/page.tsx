"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { CalendarIcon, Download, AlertTriangle } from "lucide-react"
import { format, subDays, subMonths } from "date-fns"
import { id } from "date-fns/locale"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ReportSkeleton } from "@/components/report-skeleton"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Tipe data untuk item checkout
interface CheckoutItem {
	name: string
	quantity: number
	unit: string
}

// Tipe data untuk laporan checkout
interface CheckoutReport {
	id: string | number
	date: string
	workOrder: string
	items: CheckoutItem[]
	totalItems: number
	operator: string
	status: string
	project: string
}

// Dummy data untuk laporan checkout (digunakan sebagai fallback)
const checkoutReports: CheckoutReport[] = [
	{
		id: 1,
		date: "2023-06-15",
		workOrder: "WO-2023-06-001",
		items: [
			{ name: "Terminal V-35", quantity: 120, unit: "pcs" },
			{ name: "Kabel 18 AWG", quantity: 50, unit: "meter" },
		],
		totalItems: 2,
		operator: "John Doe",
		status: "Selesai",
		project: "Harness A-12",
	},
	{
		id: 2,
		date: "2023-06-14",
		workOrder: "WO-2023-06-002",
		items: [
			{ name: "Konektor KS-12", quantity: 75, unit: "pcs" },
			{ name: "Selongsong Heatshrink", quantity: 30, unit: "meter" },
			{ name: "Terminal V-35", quantity: 40, unit: "pcs" },
		],
		totalItems: 3,
		operator: "Jane Smith",
		status: "Selesai",
		project: "Harness B-45",
	},
	{
		id: 3,
		date: "2023-06-13",
		workOrder: "WO-2023-06-003",
		items: [
			{ name: "PCB A-12", quantity: 10, unit: "pcs" },
			{ name: "Unit Catu Daya", quantity: 10, unit: "pcs" },
			{ name: "Casing Plastik", quantity: 10, unit: "pcs" },
			{ name: "Braket Logam", quantity: 20, unit: "pcs" },
		],
		totalItems: 4,
		operator: "Mike Johnson",
		status: "Selesai",
		project: "Power Supply C-10",
	},
	{
		id: 4,
		date: "2023-06-12",
		workOrder: "WO-2023-06-004",
		items: [
			{ name: "Harnes Kabel WR-10", quantity: 15, unit: "pcs" },
			{ name: "Konektor KS-12", quantity: 30, unit: "pcs" },
		],
		totalItems: 2,
		operator: "Sarah Wilson",
		status: "Selesai",
		project: "Harness D-8",
	},
	{
		id: 5,
		date: "2023-06-10",
		workOrder: "WO-2023-06-005",
		items: [
			{ name: "Kabel 18 AWG", quantity: 200, unit: "meter" },
			{ name: "Terminal V-35", quantity: 80, unit: "pcs" },
			{ name: "Selongsong Heatshrink", quantity: 100, unit: "meter" },
		],
		totalItems: 3,
		operator: "David Brown",
		status: "Selesai",
		project: "Harness E-33",
	},
]

// Komponen untuk laporan detail checkout
function CheckoutReportDetail({
	report,
	onClose,
}: {
	report: CheckoutReport
	onClose: () => void
}) {
	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>Detail Checkout #{report.workOrder}</CardTitle>
						<CardDescription>
							{format(new Date(report.date), "dd MMMM yyyy", { locale: id })}
						</CardDescription>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose}>
						&times;
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 mb-4">
					<div>
						<p className="text-sm font-medium text-muted-foreground">
							Nomor Work Order
						</p>
						<p>{report.workOrder}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground">Project</p>
						<p>{report.project}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground">
							Operator
						</p>
						<p>{report.operator}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground">Status</p>
						<Badge
							variant={report.status === "Selesai" ? "success" : "default"}
						>
							{report.status}
						</Badge>
					</div>
				</div>

				<div className="mt-6">
					<h3 className="text-sm font-medium mb-3">Daftar Item</h3>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nama Item</TableHead>
								<TableHead className="text-right">Jumlah</TableHead>
								<TableHead className="text-right">Satuan</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{report.items.map((item: CheckoutItem, index: number) => (
								<TableRow key={index}>
									<TableCell>{item.name}</TableCell>
									<TableCell className="text-right">{item.quantity}</TableCell>
									<TableCell className="text-right">{item.unit}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	)
}

export default function ReportPage() {
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [period, setPeriod] = useState("all")
	const [filteredReports, setFilteredReports] = useState<CheckoutReport[]>([])
	const [selectedReport, setSelectedReport] = useState<CheckoutReport | null>(
		null
	)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	// Fetch checkout history from the API
	const fetchCheckoutHistory = async () => {
		try {
			setLoading(true)
			setError("")

			// Prepare query parameters
			const queryParams = new URLSearchParams()

			// Apply date filters if needed
			if (date) {
				queryParams.append("startDate", format(date, "yyyy-MM-dd"))
				queryParams.append("endDate", format(date, "yyyy-MM-dd"))
			} else if (period !== "all") {
				const today = new Date()
				let startDate

				if (period === "week") {
					startDate = subDays(today, 7)
				} else if (period === "month") {
					startDate = subDays(today, 30)
				} else if (period === "quarter") {
					startDate = subMonths(today, 3)
				}

				if (startDate) {
					queryParams.append("startDate", format(startDate, "yyyy-MM-dd"))
				}
			}

			// Get token from localStorage
			const token = localStorage.getItem("token")
			if (!token) {
				setError("Otentikasi diperlukan untuk melihat riwayat checkout")
				setLoading(false)
				// Use dummy data for development
				setFilteredReports(checkoutReports)
				return
			}

			// Prepare headers
			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			}

			// Make the API call
			const response = await fetch(
				`${API_URL}/api/inventory/checkout-history?${queryParams}`,
				{
					method: "GET",
					headers,
				}
			)

			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`)
			}

			const result = await response.json()

			if (result.success && Array.isArray(result.data)) {
				setFilteredReports(result.data)
			} else {
				// Use dummy data as fallback
				console.log("Using dummy data as fallback")
				setFilteredReports(checkoutReports)
			}
		} catch (err: unknown) {
			console.error("Error fetching checkout history:", err)
			const errorMsg =
				err instanceof Error ? err.message : "Gagal mengambil data"
			setError(`Gagal mengambil data: ${errorMsg}`)

			// Use dummy data when API fails
			console.log("Using dummy data due to error")
			setFilteredReports(checkoutReports)
		} finally {
			setLoading(false)
		}
	}

	// Initial fetch
	useEffect(() => {
		fetchCheckoutHistory()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Filter reports based on selected date and period
	useEffect(() => {
		if (date || period !== "all") {
			fetchCheckoutHistory()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [date, period])

	const handleViewDetail = (report: CheckoutReport) => {
		setSelectedReport(report)
	}

	const handleExportCSV = () => {
		alert("Ekspor laporan ke CSV (fitur dummy)")
	}

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
							<div className="px-4 lg:px-6">
								{loading ? (
									<ReportSkeleton />
								) : (
									<>
										<div className="flex justify-between items-center mb-4">
											<div>
												<h1 className="text-2xl font-bold tracking-tight">
													Laporan
												</h1>
												<p className="text-muted-foreground">
													Lihat dan analisa laporan pengambilan material
												</p>
											</div>
											<Button variant="outline" onClick={handleExportCSV}>
												<Download className="mr-2 h-4 w-4" />
												Ekspor CSV
											</Button>
										</div>

										<Tabs defaultValue="checkout" className="w-full mt-6">
											<TabsList className="grid w-full grid-cols-2 mb-6">
												<TabsTrigger value="checkout">
													Laporan Checkout
												</TabsTrigger>
												<TabsTrigger value="inventory">
													Laporan Inventaris
												</TabsTrigger>
											</TabsList>

											<TabsContent value="checkout">
												<div className="flex flex-col space-y-4">
													<Card>
														<CardHeader className="pb-3">
															<CardTitle>Filter Laporan</CardTitle>
															<CardDescription>
																Pilih periode waktu atau tanggal spesifik
															</CardDescription>
														</CardHeader>
														<CardContent>
															<div className="flex flex-wrap gap-4">
																<div className="flex items-center space-x-4">
																	<Popover>
																		<PopoverTrigger asChild>
																			<Button
																				variant="outline"
																				className={cn(
																					"w-[240px] justify-start text-left font-normal",
																					!date && "text-muted-foreground"
																				)}
																			>
																				<CalendarIcon className="mr-2 h-4 w-4" />
																				{date ? (
																					format(date, "PPP", { locale: id })
																				) : (
																					<span>Pilih tanggal</span>
																				)}
																			</Button>
																		</PopoverTrigger>
																		<PopoverContent
																			className="w-auto p-0"
																			align="start"
																		>
																			<CalendarComponent
																				mode="single"
																				selected={date}
																				onSelect={(newDate) => {
																					setDate(newDate)
																					setPeriod("all")
																				}}
																				initialFocus
																			/>
																		</PopoverContent>
																	</Popover>

																	<Select
																		value={period}
																		onValueChange={(value) => {
																			setPeriod(value)
																			if (value !== "custom") setDate(undefined)
																		}}
																	>
																		<SelectTrigger className="w-[180px]">
																			<SelectValue placeholder="Pilih periode" />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="all">
																				Semua waktu
																			</SelectItem>
																			<SelectItem value="week">
																				7 hari terakhir
																			</SelectItem>
																			<SelectItem value="month">
																				30 hari terakhir
																			</SelectItem>
																			<SelectItem value="quarter">
																				3 bulan terakhir
																			</SelectItem>
																		</SelectContent>
																	</Select>

																	{date && (
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => setDate(undefined)}
																		>
																			Reset
																		</Button>
																	)}
																</div>
															</div>
														</CardContent>
													</Card>

													{error && (
														<Card className="border-red-200 bg-red-50">
															<CardContent className="pt-6">
																<div className="flex items-center gap-2 text-red-600">
																	<AlertTriangle className="h-4 w-4" />
																	<p>{error}</p>
																</div>
															</CardContent>
														</Card>
													)}

													{selectedReport ? (
														<CheckoutReportDetail
															report={selectedReport}
															onClose={() => setSelectedReport(null)}
														/>
													) : (
														<Card>
															<CardHeader className="pb-3">
																<CardTitle>Laporan Checkout Material</CardTitle>
																<CardDescription>
																	{loading
																		? "Memuat data..."
																		: `${filteredReports.length} laporan ditemukan`}
																</CardDescription>
															</CardHeader>
															<CardContent>
																{loading ? (
																	<div className="py-8 text-center">
																		<p>Memuat riwayat checkout...</p>
																	</div>
																) : (
																	<Table>
																		<TableHeader>
																			<TableRow>
																				<TableHead>No. Work Order</TableHead>
																				<TableHead>Tanggal</TableHead>
																				<TableHead>Project</TableHead>
																				<TableHead>Total Item</TableHead>
																				<TableHead>Operator</TableHead>
																				<TableHead>Status</TableHead>
																				<TableHead className="text-right">
																					Aksi
																				</TableHead>
																			</TableRow>
																		</TableHeader>
																		<TableBody>
																			{filteredReports.length > 0 ? (
																				filteredReports.map((report) => (
																					<TableRow key={report.id}>
																						<TableCell className="font-medium">
																							{report.workOrder}
																						</TableCell>
																						<TableCell>
																							{format(
																								new Date(report.date),
																								"dd MMM yyyy",
																								{ locale: id }
																							)}
																						</TableCell>
																						<TableCell>
																							{report.project}
																						</TableCell>
																						<TableCell>
																							{report.totalItems}
																						</TableCell>
																						<TableCell>
																							{report.operator}
																						</TableCell>
																						<TableCell>
																							<Badge
																								variant={
																									report.status === "Selesai"
																										? "success"
																										: "default"
																								}
																							>
																								{report.status}
																							</Badge>
																						</TableCell>
																						<TableCell className="text-right">
																							<Button
																								variant="ghost"
																								size="sm"
																								onClick={() =>
																									handleViewDetail(report)
																								}
																							>
																								Lihat Detail
																							</Button>
																						</TableCell>
																					</TableRow>
																				))
																			) : (
																				<TableRow>
																					<TableCell
																						colSpan={7}
																						className="text-center py-6 text-muted-foreground"
																					>
																						Tidak ada laporan yang ditemukan
																					</TableCell>
																				</TableRow>
																			)}
																		</TableBody>
																	</Table>
																)}
															</CardContent>
														</Card>
													)}
												</div>
											</TabsContent>

											<TabsContent value="inventory">
												<Card>
													<CardHeader>
														<CardTitle>Laporan Inventaris</CardTitle>
														<CardDescription>
															Fitur ini akan segera tersedia
														</CardDescription>
													</CardHeader>
													<CardContent className="h-[400px] flex items-center justify-center">
														<p className="text-muted-foreground">
															Sedang dalam pengembangan
														</p>
													</CardContent>
												</Card>
											</TabsContent>
										</Tabs>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
