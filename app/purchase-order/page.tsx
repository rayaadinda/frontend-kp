"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Plus, FileText, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function PurchaseOrderPage() {
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
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">

							{/* Header */}
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-2xl font-bold tracking-tight">Purchase Order</h1>
									<p className="text-muted-foreground">
										Buat dan kelola dokumen pembelian barang ke supplier
									</p>
								</div>
								<Link href="/purchase-order/create">
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										Buat PO Baru
									</Button>
								</Link>
							</div>

							{/* Info Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Card>
									<CardContent className="flex items-center gap-4 pt-6">
										<div className="h-12 w-12 rounded-sm bg-blue-50 flex items-center justify-center">
											<FileText className="h-6 w-6 text-blue-600" />
										</div>
										<div>
											<p className="text-2xl font-bold">—</p>
											<p className="text-sm text-muted-foreground">Total PO Dibuat</p>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="flex items-center gap-4 pt-6">
										<div className="h-12 w-12 rounded-sm bg-green-50 flex items-center justify-center">
											<ShoppingCart className="h-6 w-6 text-green-600" />
										</div>
										<div>
											<p className="text-2xl font-bold">—</p>
											<p className="text-sm text-muted-foreground">PO Bulan Ini</p>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="flex items-center gap-4 pt-6">
										<div className="h-12 w-12 rounded-sm bg-purple-50 flex items-center justify-center">
											<TrendingUp className="h-6 w-6 text-purple-600" />
										</div>
										<div>
											<p className="text-2xl font-bold">—</p>
											<p className="text-sm text-muted-foreground">Total Nilai PO</p>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Empty State / Main CTA */}
							<Card>
								<CardHeader>
									<CardTitle>Dokumen Purchase Order</CardTitle>
									<CardDescription>
										Fitur ini memungkinkan Anda membuat dokumen PO secara otomatis dan langsung mencetak atau mengunduhnya dalam format PDF.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col items-center justify-center py-16 gap-5">
										<div className="h-20 w-20 rounded-sm bg-muted flex items-center justify-center">
											<FileText className="h-10 w-10 text-muted-foreground" />
										</div>
										<div className="text-center max-w-md">
											<h3 className="font-semibold text-lg mb-1">Belum ada Purchase Order</h3>
											<p className="text-muted-foreground text-sm">
												Mulai buat dokumen PO pertama Anda. Isi data supplier dan daftar barang, lalu sistem akan otomatis membuat dokumen yang siap dicetak.
											</p>
										</div>
										<Link href="/purchase-order/create">
											<Button size="lg">
												<Plus className="mr-2 h-5 w-5" />
												Buat Purchase Order Sekarang
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>

							{/* Panduan Penggunaan */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{[
									{
										step: "1",
										title: "Isi Informasi PO",
										desc: "Masukkan nomor PO, tanggal, dan data lengkap supplier yang dituju.",
									},
									{
										step: "2",
										title: "Tambah Daftar Barang",
										desc: "Masukkan barang yang akan dipesan. Anda bisa mengisi otomatis dari data inventaris yang ada.",
									},
									{
										step: "3",
										title: "Preview & Cetak / Unduh",
										desc: "Preview dokumen PO Anda, kemudian cetak langsung atau unduh dalam format PDF.",
									},
								].map((guide) => (
									<Card key={guide.step} className="border-dashed">
										<CardContent className="pt-6 flex gap-4">
											<div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
												{guide.step}
											</div>
											<div>
												<p className="font-semibold text-sm mb-1">{guide.title}</p>
												<p className="text-xs text-muted-foreground">{guide.desc}</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
