"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAuthToken } from "@/lib/auth-token"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconArrowLeft, IconPackage, IconHistory, IconMapPin, IconBuildingStore, IconArrowUpRight, IconArrowDownRight, IconEdit } from "@tabler/icons-react"
import { toast } from "sonner"
import { Transaction } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface InventoryItemDetails {
	_id: string
	partNumber: string
	partName: string
	quantity: number
	unit: string
	location: string
	supplier: string
}

export default function InventoryDetailPage() {
	const params = useParams()
	const router = useRouter()
	const id = params.id as string

	const [item, setItem] = useState<InventoryItemDetails | null>(null)
	const [activities, setActivities] = useState<Transaction[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchItemDetails = async () => {
			try {
				const token = await getAuthToken()
				if (!token) return

				const res = await fetch(`${API_URL}/api/inventory`, {
					headers: { Authorization: `Bearer ${token}` }
				})

				if (!res.ok) throw new Error("Gagal mengambil data barang")
				
				const data = await res.json()
				const foundItem = data.data.find((i: InventoryItemDetails) => i._id === id)
				if (foundItem) {
					setItem(foundItem)

					// Fetch Activities
					try {
						const actRes = await fetch(`${API_URL}/api/activity?partNumber=${encodeURIComponent(foundItem.partNumber)}&limit=15`, {
							headers: { Authorization: `Bearer ${token}` }
						})
						if (actRes.ok) {
							const actData = await actRes.json()
							if (actData.success) {
								setActivities(actData.data)
							}
						}
					} catch (e) {
						console.error("Failed to fetch item activities", e)
					}

				} else {
					throw new Error("Barang tidak ditemukan")
				}
			} catch (error) {
				console.error(error)
				toast.error("Gagal memuat detail barang")
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchItemDetails()
		}
	}, [id])

	return (
		<SidebarProvider
			style={{
				"--sidebar-width": "calc(var(--spacing) * 72)",
				"--header-height": "calc(var(--spacing) * 12)",
			} as React.CSSProperties}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col p-4 md:p-6 gap-6 w-full">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" onClick={() => router.push("/inventory")}>
							<IconArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-2xl font-semibold tracking-tight">Detail Barang</h1>
					</div>

					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="col-span-2 space-y-6">
								<Skeleton className="h-[250px] w-full rounded-sm" />
								<Skeleton className="h-[300px] w-full rounded-sm" />
							</div>
							<Skeleton className="h-[400px] w-full rounded-sm" />
						</div>
					) : item ? (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2 space-y-6">
								<Card>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="text-3xl">{item.partName}</CardTitle>
												<CardDescription className="text-lg mt-1 font-mono">
													PN: {item.partNumber}
												</CardDescription>
											</div>
											<Badge variant={item.quantity === 0 ? "destructive" : item.quantity < 10 ? "secondary" : "default"} className="text-sm px-3 py-1">
												{item.quantity === 0 ? "Habis" : item.quantity < 10 ? "Menipis" : "Tersedia"}
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
											<div className="flex flex-col gap-1">
												<span className="text-sm text-muted-foreground flex items-center gap-1"><IconPackage className="h-4 w-4"/> Stok Aktual</span>
												<div className="flex flex-col">
													<span className="text-2xl font-medium">{item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit || 'Pcs'}</span></span>
													{(item.unit === 'Meter' || (item.partName && item.partName.toLowerCase().includes('wire'))) && (
														<span className="text-xs text-muted-foreground font-medium mt-0.5">≈ {Math.ceil(item.quantity / 200)} roll(s)</span>
													)}
												</div>
											</div>
											<div className="flex flex-col gap-1">
												<span className="text-sm text-muted-foreground flex items-center gap-1"><IconMapPin className="h-4 w-4"/> Lokasi</span>
												<span className="text-lg font-medium">{item.location || "-"}</span>
											</div>
											<div className="flex flex-col gap-1 col-span-2">
												<span className="text-sm text-muted-foreground flex items-center gap-1"><IconBuildingStore className="h-4 w-4"/> Supplier</span>
												<span className="text-lg font-medium">{item.supplier || "-"}</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2"><IconHistory className="h-5 w-5"/> Riwayat Aktivitas Terakhir</CardTitle>
										<CardDescription>Log pergerakan barang (masuk/keluar)</CardDescription>
									</CardHeader>
									<CardContent className="p-0">
										{activities.length > 0 ? (
											<div className="divide-y">
												{activities.map((act) => {
													const isOut = act.type === "checkout" || act.type === "leoco_production" || act.type === "delete"
													const isIn = act.type === "stock_in" || act.type === "receiving" || act.type === "add"
													return (
														<div key={act.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
															<div className="flex items-center gap-3">
																<div className={`p-2 rounded-full ${isOut ? "bg-red-100 text-red-600 dark:bg-red-900/30" : isIn ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"}`}>
																	{isOut ? <IconArrowUpRight className="h-4 w-4" /> : isIn ? <IconArrowDownRight className="h-4 w-4" /> : <IconEdit className="h-4 w-4" />}
																</div>
																<div>
																	<p className="text-sm font-medium">
																		{act.type === 'checkout' ? 'Barang Keluar' : 
																		act.type === 'stock_in' || act.type === 'receiving' ? 'Barang Masuk' : 
																		act.type === 'leoco_production' ? 'Produksi LEOCO' :
																		act.type === 'add' ? 'Penambahan Stok' :
																		act.type === 'update' ? 'Update Data' :
																		'Aktivitas'}
																		{act.workOrder && <span className="text-muted-foreground font-normal ml-1">(WO: {act.workOrder})</span>}
																	</p>
																	<p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{act.details || (act.quantity ? `Qty: ${act.quantity}` : "")}</p>
																</div>
															</div>
															<div className="text-right flex flex-col justify-center">
																<p className={`text-sm font-medium ${isOut ? "text-red-500" : isIn ? "text-green-500" : ""}`}>
																	{isOut ? "-" : isIn ? "+" : ""}{act.quantity || 0}
																</p>
																<p className="text-[10px] text-muted-foreground">{new Date(act.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
															</div>
														</div>
													)
												})}
											</div>
										) : (
											<div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
												<IconHistory className="h-8 w-8 text-muted-foreground/30 mb-2" />
												Belum ada riwayat aktivitas untuk barang ini.
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							<div className="space-y-6">
								<Card className="bg-primary/5 border-primary/20">
									<CardHeader>
										<CardTitle>Analisis Cerdas</CardTitle>
										<CardDescription>Informasi Prediktif K-Means</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex flex-col gap-1">
											<span className="text-sm text-muted-foreground">Kategori Pergerakan</span>
											<Badge variant="outline" className="w-fit bg-background text-sm">Sedang Dihitung...</Badge>
										</div>
										<p className="text-sm text-muted-foreground pt-4 border-t border-primary/10">
											Informasi forecasting dan rekomendasi pemesanan ulang otomatis akan muncul di sini setelah K-Means dijalankan.
										</p>
										<Button className="w-full mt-2" variant="outline" onClick={() => router.push("/prediction")}>
											Lihat Dashboard Analisis
										</Button>
									</CardContent>
								</Card>
							</div>
						</div>
					) : (
						<div className="text-center py-12">
							<h3 className="text-lg font-medium">Barang tidak ditemukan</h3>
						</div>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
