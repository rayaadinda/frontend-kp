"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState, Suspense } from "react"
import { getAuthToken } from "@/lib/auth-token"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface BomItem {
	childPartNumber: string
	childPartName: string
	quantityRequired: number
	unit: string
}

function CreateBomForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const editId = searchParams.get("id")

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	
	const [kingPartNumber, setKingPartNumber] = useState("")
	const [kingPartName, setKingPartName] = useState("")
	const [items, setItems] = useState<BomItem[]>([
		{ childPartNumber: "", childPartName: "", quantityRequired: 0, unit: "pcs" }
	])

	useEffect(() => {
		if (editId) {
			fetchBom(editId)
		}
	}, [editId])

	const fetchBom = async (id: string) => {
		try {
			setIsLoading(true)
			const token = await getAuthToken()
			const res = await fetch(`${API_URL}/api/bom/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) throw new Error("Gagal mengambil data BOM")
			
			const result = await res.json()
			const bom = result.data
			setKingPartNumber(bom.kingPartNumber)
			setKingPartName(bom.kingPartName)
			if (bom.items && bom.items.length > 0) {
				setItems(bom.items.map((item: BomItem) => ({
					childPartNumber: item.childPartNumber,
					childPartName: item.childPartName,
					quantityRequired: item.quantityRequired,
					unit: item.unit
				})))
			}
		} catch (error) {
			console.error("Error:", error)
			toast.error("Gagal memuat data B.O.M untuk di-edit")
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddItem = () => {
		setItems([...items, { childPartNumber: "", childPartName: "", quantityRequired: 0, unit: "pcs" }])
	}

	const handleRemoveItem = (index: number) => {
		if (items.length > 1) {
			setItems(items.filter((_, i) => i !== index))
		} else {
			toast.error("BOM minimal harus memiliki 1 anak material")
		}
	}

	const handleItemChange = (index: number, field: keyof BomItem, value: string | number) => {
		const newItems = [...items]
		if (field === 'quantityRequired') {
			newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0
		} else {
			// @ts-expect-error - we know the types match the fields dynamically
			newItems[index][field] = value
		}
		setItems(newItems)
	}

	const handleSave = async () => {
		if (!kingPartNumber || !kingPartName) {
			toast.error("Lengkapi Part Number dan Nama Target Produksi")
			return
		}

		// Validasi items
		const invalidItems = items.filter(i => !i.childPartNumber || !i.childPartName || i.quantityRequired <= 0)
		if (invalidItems.length > 0) {
			toast.error("Pastikan semua anak material memiliki Part Number, Nama, dan Kuantitas > 0")
			return
		}

		setIsSubmitting(true)
		try {
			const token = await getAuthToken()
			const payload = {
				kingPartNumber,
				kingPartName,
				items
			}

			const url = editId ? `${API_URL}/api/bom/${editId}` : `${API_URL}/api/bom`
			const method = editId ? "PUT" : "POST"

			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.message || "Gagal menyimpan BOM")
			}

			toast.success(editId ? "BOM berhasil diupdate" : "BOM berhasil dibuat")
			router.push("/bom")
		} catch (error) {
			console.error("Error saving BOM:", error)
			toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan BOM")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) return <div>Memuat...</div>

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div className="flex items-center gap-4">
					<Link href="/bom">
						<Button variant="outline" size="icon" className="rounded-sm">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<h2 className="text-3xl font-semibold tracking-tight">
						{editId ? "Edit Master B.O.M" : "Tambah Master B.O.M"}
					</h2>
				</div>
				<Button onClick={handleSave} disabled={isSubmitting} className="rounded-sm">
					<Save className="mr-2 h-4 w-4" />
					{isSubmitting ? "Menyimpan..." : "Simpan B.O.M"}
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{/* FORM KING PART */}
				<Card className="md:col-span-1 h-fit rounded-sm">
					<CardHeader>
						<CardTitle>Info Target Produksi</CardTitle>
						<CardDescription>Barang jadi yang dipesan LEOCO</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="king-pn">Part Number</Label>
							<Input 
								id="king-pn" 
								placeholder="Contoh: D4PM050LP01438" 
								value={kingPartNumber}
								onChange={e => setKingPartNumber(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="king-name">Nama Part / Deskripsi</Label>
							<Input 
								id="king-name" 
								placeholder="Nama Target Produksi..." 
								value={kingPartName}
								onChange={e => setKingPartName(e.target.value)}
							/>
						</div>
					</CardContent>
				</Card>

				{/* FORM ANAK MATERIAL */}
				<Card className="md:col-span-2 rounded-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<div>
							<CardTitle>B.O.M / Anak Material</CardTitle>
							<CardDescription>Bahan baku yang dibutuhkan untuk membuat 1 Target Produksi</CardDescription>
						</div>
						<Button size="sm" variant="outline" onClick={handleAddItem} className="rounded-sm">
							<Plus className="mr-2 h-4 w-4" /> Tambah Material
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-md border overflow-hidden">
							<table className="w-full text-sm">
								<thead className="bg-muted">
									<tr>
										<th className="p-3 text-left font-medium">Part Number</th>
										<th className="p-3 text-left font-medium">Nama Material</th>
										<th className="p-3 text-center font-medium w-[120px]">Kebutuhan</th>
										<th className="p-3 text-left font-medium w-[100px]">Satuan</th>
										<th className="p-3 text-center font-medium w-[60px]">Aksi</th>
									</tr>
								</thead>
								<tbody>
									{items.map((item, index) => (
										<tr key={index} className="border-t">
											<td className="p-2">
												<Input 
													placeholder="RD-YL"
													value={item.childPartNumber}
													onChange={(e) => handleItemChange(index, "childPartNumber", e.target.value)}
												/>
											</td>
											<td className="p-2">
												<Input 
													placeholder="Kabel Merah..."
													value={item.childPartName}
													onChange={(e) => handleItemChange(index, "childPartName", e.target.value)}
												/>
											</td>
											<td className="p-2">
												<Input 
													type="number"
													step="0.01"
													min="0"
													value={item.quantityRequired || ""}
													onChange={(e) => handleItemChange(index, "quantityRequired", e.target.value)}
													className="text-center"
												/>
											</td>
											<td className="p-2">
												<Input 
													placeholder="pcs/m"
													value={item.unit}
													onChange={(e) => handleItemChange(index, "unit", e.target.value)}
												/>
											</td>
											<td className="p-2 text-center">
												<Button 
													variant="ghost" 
													size="icon" 
													className="text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() => handleRemoveItem(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default function CreateBomPage() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<Suspense fallback={<div className="p-8">Memuat form...</div>}>
					<CreateBomForm />
				</Suspense>
			</SidebarInset>
		</SidebarProvider>
	)
}
