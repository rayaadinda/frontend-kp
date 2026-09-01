"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { getAuthToken } from "@/lib/auth-token"
import { Transaction, TransactionItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconArrowLeft, IconPackageImport, IconCalendar, IconUser, IconHash, IconNotes } from "@tabler/icons-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function StockInDetailPage() {
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

				const res = await fetch(`${API_URL}/api/inventory/stock-ins/${id}`, {
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
						<Button variant="outline" size="icon" onClick={() => router.push("/stock-in")}>
							<IconArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">Detail Barang Masuk</h1>
							<p className="text-muted-foreground text-sm">Informasi lengkap transaksi penerimaan barang</p>
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
												<Badge variant="default" className="bg-green-600 hover:bg-green-700">Stock In</Badge>
												<Badge variant="outline">{transaction.type}</Badge>
											</div>
											<CardTitle className="text-xl mb-1">{transaction.transactionId}</CardTitle>
											<CardDescription>
												{transaction.kingPartNumber 
													? `Target Produksi: ${transaction.kingPartNumber} (Qty: ${transaction.quantity})`
													: "Penerimaan Material Reguler"
												}
											</CardDescription>
										</div>
										<div className="p-3 bg-primary/10 rounded-full">
											<IconPackageImport className="h-6 w-6 text-primary" />
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconCalendar className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Waktu Transaksi</p>
												<p className="text-sm font-semibold">{new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconUser className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Operator</p>
												<p className="text-sm font-semibold">{transaction.performedBy?.name || "System"}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconHash className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Work Order</p>
												<p className="text-sm font-semibold">{transaction.workOrder || "-"}</p>
											</div>
										</div>
										<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm">
											<IconNotes className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-xs text-muted-foreground font-medium">Catatan</p>
												<p className="text-sm font-semibold">{transaction.notes || "-"}</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Daftar Material Diterima</CardTitle>
									<CardDescription>Rincian barang mentah yang masuk ke dalam gudang</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="rounded-sm border overflow-hidden">
										<table className="w-full text-sm text-left">
											<thead className="bg-muted">
												<tr>
													<th className="px-4 py-3 font-medium text-muted-foreground">No</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Part Number</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Nama Barang</th>
													<th className="px-4 py-3 font-medium text-muted-foreground text-right">Kuantitas</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Satuan</th>
												</tr>
											</thead>
											<tbody className="divide-y bg-card">
												{transaction.items && transaction.items.map((item: TransactionItem, index: number) => (
													<tr key={item.id} className="hover:bg-muted/50">
														<td className="px-4 py-3 w-12">{index + 1}</td>
														<td className="px-4 py-3 font-medium">{item.partNumber}</td>
														<td className="px-4 py-3">{item.partName}</td>
														<td className="px-4 py-3 text-right text-green-600 font-medium">+{item.quantity}</td>
														<td className="px-4 py-3">{item.unit}</td>
													</tr>
												))}
												{(!transaction.items || transaction.items.length === 0) && (
													<tr>
														<td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Tidak ada item ditemukan</td>
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
