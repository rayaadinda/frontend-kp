"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState, useMemo } from "react"
import { getAuthToken } from "@/lib/auth-token"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { IconPackage, IconFilter, IconCalendarEvent, IconArrowDownLeft, IconArrowUpRight, IconDatabase, IconPercentage, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface InventoryItem {
	_id: string
	partNumber: string
	partName: string
	supplier: string
	quantity: number
	unit: string
	workOrder: string
	reference?: string
	createdAt: string
}

interface ActivityItem {
	id: string
	type: string
	partNumber: string
	quantity: number
	createdAt: string
	details: string
}

type GroupedChild = {
	partNumber: string
	partName: string
	unit: string
	partName: string
	unit: string
	totalQuantity: number
	wos: { workOrder: string; date: string; in: number; out: number; balance: number }[]
}

const MONTHS = [
	{ value: "1", label: "Januari" },
	{ value: "2", label: "Februari" },
	{ value: "3", label: "Maret" },
	{ value: "4", label: "April" },
	{ value: "5", label: "Mei" },
	{ value: "6", label: "Juni" },
	{ value: "7", label: "Juli" },
	{ value: "8", label: "Agustus" },
	{ value: "9", label: "September" },
	{ value: "10", label: "Oktober" },
	{ value: "11", label: "November" },
	{ value: "12", label: "Desember" }
]

const YEARS = ["2026", "2027", "2028", "2029", "2030"]

export default function LeocoBalanceReportPage() {
	const currentDate = new Date()
	const [inventory, setInventory] = useState<InventoryItem[]>([])
	const [activities, setActivities] = useState<ActivityItem[]>([])
	const [summaryData, setSummaryData] = useState({ totalIn: 0, totalOut: 0, outstanding: 0 })
	
	const [loading, setLoading] = useState(true)
	const [selectedKingPart, setSelectedKingPart] = useState<string>("All")
	const [selectedMonth, setSelectedMonth] = useState<string>(String(currentDate.getMonth() + 1))
	const [selectedYear, setSelectedYear] = useState<string>(String(currentDate.getFullYear()))

	const fetchInventory = async () => {
		try {
			setLoading(true)
			const token = await getAuthToken()
			if (!token) return

			const response = await fetch(`${API_URL}/api/inventory/leoco-monthly?month=${selectedMonth}&year=${selectedYear}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const resData = await response.json()
			
			if (resData.success) {
				setInventory(resData.data.inventory)
				setSummaryData(resData.data.summary)
				setActivities(resData.data.activities)
			}
		} catch (error) {
			console.error("Failed to fetch monthly report", error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchInventory()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonth, selectedYear])

	const { kingPartsOptions, groupedData } = useMemo(() => {
		const kingPartsMap = new Map<string, Map<string, GroupedChild>>()

		inventory.forEach(item => {
			const kingPart = item.reference || "Lainnya"
			if (!kingPartsMap.has(kingPart)) {
				kingPartsMap.set(kingPart, new Map())
			}
			const childMap = kingPartsMap.get(kingPart)!
			
			if (!childMap.has(item.partNumber)) {
				childMap.set(item.partNumber, {
					partNumber: item.partNumber,
					partName: item.partName,
					unit: item.unit || "Pcs",
					totalQuantity: 0,
					wos: []
				})
			}
			
			const childEntry = childMap.get(item.partNumber)!
			childEntry.totalQuantity += item.quantity
			
			const woIn = activities
				.filter(a => a.partNumber === item.partNumber && (a.type === 'receiving' || a.type === 'add') && a.details?.includes(item.workOrder))
				.reduce((sum, a) => sum + (a.quantity || 0), 0)
				
			const woOut = activities
				.filter(a => a.partNumber === item.partNumber && a.type === 'checkout' && a.details?.includes(item.workOrder))
				.reduce((sum, a) => sum + (a.quantity || 0), 0)

			childEntry.wos.push({
				workOrder: item.workOrder || "No WO",
				date: new Date(item.createdAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' }),
				in: woIn,
				out: woOut,
				balance: item.quantity
			})
		})

		const options = Array.from(kingPartsMap.keys()).sort()
		return { kingPartsOptions: options, groupedData: kingPartsMap }
	}, [inventory, activities])

	// If "All" is selected, we combine all children
	const displayedChildren = useMemo(() => {
		if (selectedKingPart === "All") {
			// Merge everything
			const allMap = new Map<string, GroupedChild>()
			Array.from(groupedData.values()).forEach(childMap => {
				Array.from(childMap.values()).forEach(child => {
					if (!allMap.has(child.partNumber)) {
						// Deep copy to avoid mutating original
						allMap.set(child.partNumber, {
							...child,
							wos: [...child.wos]
						})
					} else {
						const existing = allMap.get(child.partNumber)!
						existing.totalQuantity += child.totalQuantity
						existing.wos.push(...child.wos)
					}
				})
			})
			return Array.from(allMap.values()).sort((a,b) => b.totalQuantity - a.totalQuantity)
		} else {
			const childMap = groupedData.get(selectedKingPart)
			if (!childMap) return []
			return Array.from(childMap.values()).sort((a,b) => b.totalQuantity - a.totalQuantity)
		}
	}, [groupedData, selectedKingPart])

	const vtaBk = summaryData.totalIn > 0 ? ((summaryData.totalOut / summaryData.totalIn) * 100).toFixed(0) : 0

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
				<div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">Laporan Saldo LEOCO</h1>
							<p className="text-muted-foreground font-light mt-1">Laporan sisa stok dan riwayat aktivitas LEOCO bulanan.</p>
						</div>
						<div className="flex items-center gap-2">
							<IconCalendarEvent className="text-muted-foreground h-5 w-5" />
							<Select value={selectedMonth} onValueChange={setSelectedMonth}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="Bulan" />
								</SelectTrigger>
								<SelectContent>
									{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
								</SelectContent>
							</Select>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger className="w-[100px]">
									<SelectValue placeholder="Tahun" />
								</SelectTrigger>
								<SelectContent>
									{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<Card className="p-4 gap-3 shadow-sm rounded-lg border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
							<div className="flex items-center gap-2">
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
									<IconArrowDownLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
								</div>
								<div className="text-sm font-medium text-muted-foreground">Total In</div>
							</div>
							<div className="flex flex-col gap-2 mt-1">
								<div className="text-2xl font-medium tracking-tight leading-none">
									{summaryData.totalIn.toLocaleString('id-ID')}
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
										<IconTrendingUp className="w-3 h-3" />
										<span>8%</span>
									</div>
									<span className="text-[11px] text-muted-foreground font-medium">VS Bulan Lalu</span>
								</div>
							</div>
						</Card>

						<Card className="p-4 gap-3 shadow-sm rounded-lg border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
							<div className="flex items-center gap-2">
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
									<IconArrowUpRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
								</div>
								<div className="text-sm font-medium text-muted-foreground">Total Out</div>
							</div>
							<div className="flex flex-col gap-2 mt-1">
								<div className="text-2xl font-medium tracking-tight leading-none">
									{summaryData.totalOut.toLocaleString('id-ID')}
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
										<IconTrendingDown className="w-3 h-3" />
										<span>1.8%</span>
									</div>
									<span className="text-[11px] text-muted-foreground font-medium">VS Bulan Lalu</span>
								</div>
							</div>
						</Card>

						<Card className="p-4 gap-3 shadow-sm rounded-lg border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
							<div className="flex items-center gap-2">
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
									<IconDatabase className="w-4 h-4 text-slate-600 dark:text-slate-300" />
								</div>
								<div className="text-sm font-medium text-muted-foreground">OS (Outstanding)</div>
							</div>
							<div className="flex flex-col gap-2 mt-1">
								<div className="text-2xl font-medium tracking-tight leading-none">
									{summaryData.outstanding.toLocaleString('id-ID')}
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
										<IconTrendingUp className="w-3 h-3" />
										<span>18%</span>
									</div>
									<span className="text-[11px] text-muted-foreground font-medium">VS Bulan Lalu</span>
								</div>
							</div>
						</Card>

						<Card className="p-4 gap-3 shadow-sm rounded-lg border-primary/20 bg-primary/5 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
							<div className="flex items-center gap-2">
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
									<IconPercentage className="w-4 h-4 text-primary" />
								</div>
								<div className="text-sm font-medium text-primary/80">VTA BK (%)</div>
							</div>
							<div className="flex flex-col gap-2 mt-1">
								<div className="text-2xl font-medium tracking-tight leading-none text-primary">
									{vtaBk}%
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
										<IconTrendingDown className="w-3 h-3" />
										<span>1.2%</span>
									</div>
									<span className="text-[11px] text-primary/60 font-medium">VS Bulan Lalu</span>
								</div>
							</div>
						</Card>
					</div>

					<Card className="border-border/60 shadow-sm">
						<CardHeader className="bg-muted/30 pb-4 border-b">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div className="flex items-center gap-2 text-lg font-semibold">
									<IconFilter className="h-5 w-5 text-primary" />
									Filter Target Part
								</div>
								<Select value={selectedKingPart} onValueChange={setSelectedKingPart}>
									<SelectTrigger className="w-full sm:w-[350px]">
										<SelectValue placeholder="Pilih Target Part..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="All">Semua Target Part (Keseluruhan)</SelectItem>
										{kingPartsOptions.map(kp => (
											<SelectItem key={kp} value={kp}>
												Target Part: <span className="font-medium text-primary">{kp}</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{loading ? (
								<div className="space-y-4 p-6">
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
								</div>
							) : displayedChildren.length === 0 ? (
								<div className="text-center p-12 text-muted-foreground">
									<IconPackage className="h-12 w-12 mx-auto mb-4 opacity-20" />
									Tidak ada pergerakan material LEOCO di bulan yang dipilih.
								</div>
							) : (
								<Accordion type="multiple" className="w-full">
									{displayedChildren.map((child) => (
										<AccordionItem key={child.partNumber} value={child.partNumber} className="border-b last:border-b-0">
											<AccordionTrigger className="hover:no-underline hover:bg-muted/30 px-6 py-4 transition-colors data-[state=open]:bg-muted/10">
												<div className="flex flex-1 items-center justify-between pr-4">
													<div className="flex flex-col items-start gap-1 text-left">
														<span className="font-semibold text-base text-primary">{child.partNumber}</span>
														<span className="text-xs text-muted-foreground line-clamp-1">{child.partName}</span>
													</div>
													<div className="flex flex-col items-end gap-0.5">
														<span className="font-medium text-lg text-foreground">
															{child.totalQuantity} <span className="text-sm font-normal text-muted-foreground">{child.unit}</span>
														</span>
														{(child.unit === 'Meter' || child.partName.toLowerCase().includes('wire')) && (
															<span className="text-[10px] text-muted-foreground font-medium">
																≈ {Math.ceil(child.totalQuantity / 200)} roll(s)
															</span>
														)}
													</div>
												</div>
											</AccordionTrigger>
											<AccordionContent className="pb-0 pt-0">
												<div className="bg-muted/10 border-t flex flex-col">
													<div className="flex px-6 py-2 text-xs font-medium text-muted-foreground bg-muted/20 border-b">
														<div className="w-24 pl-6 border-l-2 border-primary/30">Tanggal</div>
														<div className="flex-1">Referensi Work Order</div>
														<div className="w-20 text-right">TOTAL IN</div>
														<div className="w-20 text-right">TOTAL OUT</div>
														<div className="w-28 text-right pr-4">Sisa Stok (OS)</div>
													</div>
													{child.wos.map((wo, idx) => (
														<div key={idx} className="flex px-6 py-3 text-sm hover:bg-muted/30 transition-colors border-b last:border-b-0">
															<div className="w-24 text-muted-foreground text-xs pl-6 border-l-2 border-primary/30 flex items-center">
																{wo.date}
															</div>
															<div className="flex-1 font-mono text-xs flex items-center">
																{wo.workOrder}
															</div>
															<div className="w-20 text-right tabular-nums text-emerald-600 font-medium">
																{wo.in > 0 ? wo.in : "-"}
															</div>
															<div className="w-20 text-right tabular-nums text-rose-600 font-medium">
																{wo.out > 0 ? wo.out : "-"}
															</div>
															<div className="w-28 text-right tabular-nums pr-4">
																<span className="font-medium text-foreground">{wo.balance}</span> <span className="text-muted-foreground text-[10px]">{child.unit}</span>
															</div>
														</div>
													))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							)}
						</CardContent>
					</Card>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
