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
import { IconArrowLeft, IconPackageExport, IconCalendar, IconUser, IconHash, IconNotes, IconInfoCircle } from "@tabler/icons-react"
import { toast } from "sonner"
import { Transaction, TransactionItem } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function CheckoutDetailPage() {
	const params = useParams()
	const router = useRouter()
	const id = params.id as string

	const [transaction, setTransaction] = useState<Transaction | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchTransactionDetails = async () => {
			try {
				const token = await getAuthToken()
				if (!token) return

				const res = await fetch(`${API_URL}/api/checkout/${id}`, {
					headers: { Authorization: `Bearer ${token}` }
				})

				if (!res.ok) throw new Error("Gagal mengambil data transaksi")
				
				const data = await res.json()
				if (data.success) {
					setTransaction(data.data)
				} else {
					throw new Error(data.message || "Transaksi tidak ditemukan")
				}
			} catch (error) {
				console.error(error)
				toast.error("Gagal memuat detail transaksi")
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchTransactionDetails()
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
						<Button variant="outline" size="icon" onClick={() => router.push("/checkout")}>
							<IconArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">Detail Barang Keluar</h1>
							<p className="text-muted-foreground text-sm">Informasi lengkap transaksi pengeluaran/produksi</p>
						</div>
					</div>

					{loading ? (
						<div className="space-y-6">
							<Skeleton className="h-[200px] w-full rounded-sm" />
							<Skeleton className="h-[400px] w-full rounded-sm" />
						</div>
					) : transaction ? (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Badge variant="default" className="bg-red-600 hover:bg-red-700">Checkout</Badge>
												<Badge variant="outline">{transaction.status}</Badge>
											</div>
											<CardTitle className="text-xl mb-1">Work Order: {transaction.workOrder}</CardTitle>
											<CardDescription>
												{transaction.kingPartNumber 
													? `Target Produksi: ${transaction.kingPartNumber} (Target: ${transaction.quantity} pcs)`
													: transaction.project || "Pengeluaran Reguler"
												}
											</CardDescription>
										</div>
										<div className="p-3 bg-red-100/50 rounded-full">
											<IconPackageExport className="h-6 w-6 text-red-600" />
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconCalendar className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Waktu Transaksi</p>
												<p className="text-sm font-semibold">{new Date(transaction.checkoutDate || transaction.createdAt).toLocaleString('id-ID')}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconUser className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Operator</p>
												<p className="text-sm font-semibold">{transaction.createdBy?.name || transaction.createdBy?.username || "System"}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconHash className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Status</p>
												<p className="text-sm font-semibold">{transaction.status}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconInfoCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Jenis Transaksi</p>
												<p className="text-sm font-semibold">{transaction.kingPartNumber ? "Produksi LEOCO" : "Reguler"}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconNotes className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Catatan</p>
												<p className="text-sm font-semibold">{transaction.notes || transaction.project || "-"}</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Daftar Material Dikeluarkan</CardTitle>
									<CardDescription>Rincian barang mentah yang dipotong dari inventaris gudang</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="rounded-sm border overflow-hidden">
										<table className="w-full text-sm text-left">
											<thead className="bg-muted">
												<tr>
													<th className="px-4 py-3 font-medium text-muted-foreground w-12">No</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Detail Barang / Part</th>
													<th className="px-4 py-3 font-medium text-muted-foreground text-right">Kuantitas Terpotong</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Satuan</th>
												</tr>
											</thead>
											<tbody className="divide-y bg-card">
												{transaction.items && transaction.items.map((item: TransactionItem, index: number) => (
													<tr key={item.id} className="hover:bg-muted/50">
														<td className="px-4 py-3">{index + 1}</td>
														<td className="px-4 py-3 font-medium">{item.name || item.partName || "-"}</td>
														<td className="px-4 py-3 text-right text-red-600 font-medium">-{item.quantity}</td>
														<td className="px-4 py-3">{item.unit}</td>
													</tr>
												))}
												{(!transaction.items || transaction.items.length === 0) && (
													<tr>
														<td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Tidak ada item ditemukan</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						</div>
					) : (
						<div className="p-8 text-center border rounded-sm bg-muted/20">
							<p className="text-muted-foreground">Transaksi tidak ditemukan</p>
						</div>
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
