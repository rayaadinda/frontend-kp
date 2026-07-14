"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { InventoryDataTable } from "@/components/inventory-data-table"
import { InventoryDataTableSkeleton } from "@/components/inventory-data-table-skeleton"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth-token"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface InventoryItem {
	id: number
	name: string
	supplier: string
	quantity: number
	unit: string
	price: number
	status: "In Stock" | "Low Stock" | "Out of Stock"
	lastUpdated: string
	workOrder: string
	reference?: string
}

// Function to map backend data to frontend format
const mapApiDataToInventoryItem = (apiData: unknown): InventoryItem => {
	if (typeof apiData !== "object" || apiData === null) {
		throw new Error("Invalid API data")
	}
	const item = apiData as Record<string, unknown>
	// Determine status based on quantity
	let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock"
	if ((item.quantity as number) === 0) {
		status = "Out of Stock"
	} else if ((item.quantity as number) < 10) {
		status = "Low Stock"
	}

	return {
		id: item._id as number,
		name: item.partName as string,
		supplier: (item.supplier as string) || "-",
		quantity: item.quantity as number,
		unit: (item.unit as string) || "Pcs",
		price: 0,
		status: status,
		lastUpdated: new Date(item.lastUpdated as string).toLocaleDateString(),
		workOrder: (item.workOrder as string) || "GENERAL",
		reference: item.reference as string | undefined,
	}
}

export default function InventoryPage() {
	const [inventory, setInventory] = useState<InventoryItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [selectedLeocoWo, setSelectedLeocoWo] = useState<string>("All")

	// Fetch inventory data function
	const fetchInventory = async () => {
		try {
			setLoading(true)
			setError("")

			// Prepare headers
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			}

			const token = await getAuthToken()

			if (!token) {
				setError("Authentication required")
				setLoading(false)
				return
			}

			headers["Authorization"] = `Bearer ${token}`

			// Actual API call
			const response = await fetch(`${API_URL}/api/inventory`, { headers })

			if (!response.ok) {
				throw new Error(`Failed to fetch inventory: ${response.status}`)
			}

			const data = await response.json()

			if (data.success && Array.isArray(data.data)) {
				// Map API data to our frontend format
				const inventoryItems = data.data.map(mapApiDataToInventoryItem)
				setInventory(inventoryItems)
			} else {
				throw new Error("Invalid data format received from API")
			}
		} catch (err: unknown) {
			console.error("Error fetching inventory:", err)
			const errorMsg =
				err instanceof Error ? err.message : "Failed to fetch inventory"
			setError(errorMsg)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchInventory()
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
							<div className="px-4 lg:px-6">
								<h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
								<p className="text-muted-foreground">
									Manage your inventory items and stock levels
								</p>
							</div>
							<div className="px-4 lg:px-6">
								{loading ? (
									<InventoryDataTableSkeleton />
								) : error ? (
									<div className="bg-red-50 p-4 rounded-md border border-red-200">
										<h3 className="text-red-600 font-medium mb-2">Error</h3>
										<p className="text-red-500">{error}</p>
									</div>
								) : (
									<Tabs defaultValue="Semua" className="w-full">
										<TabsList className="mb-4 flex flex-wrap h-auto gap-1">
											<TabsTrigger value="Semua">Semua Vendor</TabsTrigger>
											<TabsTrigger value="LEOCO">LEOCO</TabsTrigger>
											<TabsTrigger value="BSG">BSG</TabsTrigger>
											<TabsTrigger value="YMK">YMK</TabsTrigger>
											<TabsTrigger value="Lainnya">Lainnya</TabsTrigger>
										</TabsList>
										
										<TabsContent value="Semua">
											<Card>
												<CardContent className="p-0 sm:p-6">
													<InventoryDataTable data={inventory} onRefresh={fetchInventory} />
												</CardContent>
											</Card>
										</TabsContent>

										<TabsContent value="LEOCO" className="space-y-6">
											{(() => {
												const leocoData = inventory.filter(i => (i.supplier || "").toUpperCase() === "LEOCO")
												if (leocoData.length === 0) return <div className="p-8 text-center text-muted-foreground border rounded-lg">Tidak ada stok dari LEOCO</div>

												// Map Work Order ke King Part (reference)
												const woMap = new Map<string, string>()
												leocoData.forEach(i => {
													if (i.workOrder && !woMap.has(i.workOrder)) {
														woMap.set(i.workOrder, i.reference || "Unknown Target Produksi")
													}
												})
												
												// Filter the data based on selected WO
												const displayedData = selectedLeocoWo === "All" 
													? leocoData 
													: leocoData.filter(i => i.workOrder === selectedLeocoWo)

												return (
													<Card>
														<CardHeader className="bg-muted/30 pb-4 border-b">
															<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
																<div>
																	<CardTitle className="text-lg">Inventaris LEOCO</CardTitle>
																	<CardDescription>Filter dan lihat material LEOCO berdasarkan Work Order spesifik.</CardDescription>
																</div>
																<Select value={selectedLeocoWo} onValueChange={setSelectedLeocoWo}>
																	<SelectTrigger className="w-full sm:w-[350px]">
																		<SelectValue placeholder="Pilih Work Order & King Part" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="All">Semua Work Order</SelectItem>
																		{Array.from(woMap.entries()).map(([wo, kingPart]) => (
																			<SelectItem key={wo} value={wo}>
																				WO: <span className="font-medium text-primary">{wo}</span> — ({kingPart})
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>
														</CardHeader>
														<CardContent className="p-0 sm:p-6 pt-4">
															<InventoryDataTable 
																data={displayedData} 
																onRefresh={fetchInventory} 
															/>
														</CardContent>
													</Card>
												)
											})()}
										</TabsContent>

										<TabsContent value="BSG">
											<Card>
												<CardContent className="p-0 sm:p-6">
													<InventoryDataTable 
														data={inventory.filter(i => (i.supplier || "").toUpperCase() === "BSG")} 
														onRefresh={fetchInventory} 
													/>
												</CardContent>
											</Card>
										</TabsContent>

										<TabsContent value="YMK">
											<Card>
												<CardContent className="p-0 sm:p-6">
													<InventoryDataTable 
														data={inventory.filter(i => (i.supplier || "").toUpperCase() === "YMK")} 
														onRefresh={fetchInventory} 
													/>
												</CardContent>
											</Card>
										</TabsContent>

										<TabsContent value="Lainnya">
											<Card>
												<CardContent className="p-0 sm:p-6">
													<InventoryDataTable 
														data={inventory.filter(i => {
															const sup = (i.supplier || "").toUpperCase()
															return sup !== "LEOCO" && sup !== "BSG" && sup !== "YMK"
														})} 
														onRefresh={fetchInventory} 
													/>
												</CardContent>
											</Card>
										</TabsContent>
									</Tabs>
								)}
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
