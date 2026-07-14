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
import { IconArrowLeft, IconPackage, IconHistory, IconMapPin, IconBuildingStore } from "@tabler/icons-react"
import { toast } from "sonner"

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
						<h1 className="text-2xl font-bold tracking-tight">Detail Barang</h1>
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
												<span className="text-2xl font-bold">{item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit || 'Pcs'}</span></span>
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
									<CardContent>
										<div className="text-sm text-muted-foreground">
											Aktivitas akan ditampilkan di sini jika sudah ada relasi ke tabel aktivitas.
											{/* TODO: Fetch and map activity logs here */}
										</div>
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
