"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth-token"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface BomItem {
	id: string
	childPartNumber: string
	childPartName: string
	quantityRequired: number
	unit: string
}

interface BomData {
	id: string
	kingPartNumber: string
	kingPartName: string
	updatedAt: string
	items: BomItem[]
}

export default function BomPage() {
	const [boms, setBoms] = useState<BomData[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchBoms()
	}, [])

	const fetchBoms = async () => {
		try {
			setIsLoading(true)
			const token = await getAuthToken()
			const res = await fetch(`${API_URL}/api/bom`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (!res.ok) throw new Error("Gagal mengambil data BOM")
			const result = await res.json()
			setBoms(result.data)
		} catch (error) {
			console.error("Error fetching BOMs:", error)
			toast.error("Gagal memuat data Master BOM")
		} finally {
			setIsLoading(false)
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm("Apakah Anda yakin ingin menghapus B.O.M ini?")) return
		
		try {
			const token = await getAuthToken()
			const res = await fetch(`${API_URL}/api/bom/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (!res.ok) throw new Error("Gagal menghapus BOM")
			toast.success("BOM berhasil dihapus")
			fetchBoms()
		} catch (error) {
			console.error("Error deleting BOM:", error)
			toast.error("Gagal menghapus B.O.M")
		}
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
					<div className="flex items-center justify-between space-y-2">
						<h2 className="text-3xl font-semibold tracking-tight">Master B.O.M</h2>
						<div className="flex items-center space-x-2">
							<Link href="/bom/create">
								<Button className="rounded-sm">
									<Plus className="mr-2 h-4 w-4" /> Tambah B.O.M
								</Button>
							</Link>
						</div>
					</div>

					<Card className="rounded-sm">
						<CardHeader>
							<CardTitle>Daftar Bill of Materials</CardTitle>
							<CardDescription>
								Kelola resep/anak material untuk setiap Target Produksi LEOCO.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="text-center py-10">Memuat data...</div>
							) : boms.length === 0 ? (
								<div className="text-center py-10 text-muted-foreground border rounded-sm">
									Belum ada data Master B.O.M
								</div>
							) : (
								<div className="rounded-sm border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Target Part Number</TableHead>
												<TableHead>Nama Part</TableHead>
												<TableHead>Jumlah Anak Material</TableHead>
												<TableHead>Terakhir Diupdate</TableHead>
												<TableHead className="text-right">Aksi</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{boms.map((bom) => (
												<TableRow key={bom.id}>
													<TableCell className="font-medium">{bom.kingPartNumber}</TableCell>
													<TableCell>{bom.kingPartName}</TableCell>
													<TableCell>{bom.items.length} item</TableCell>
													<TableCell>{new Date(bom.updatedAt).toLocaleDateString("id-ID")}</TableCell>
													<TableCell className="text-right">
														<div className="flex justify-end gap-2">
															<Link href={`/bom/create?id=${bom.id}`}>
																<Button variant="outline" size="icon" title="Edit" className="rounded-sm">
																	<Edit className="h-4 w-4" />
																</Button>
															</Link>
															<Button 
																variant="destructive" 
																size="icon" 
																title="Hapus"
																className="rounded-sm"
																onClick={() => handleDelete(bom.id)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
