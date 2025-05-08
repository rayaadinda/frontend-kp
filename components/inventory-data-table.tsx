"use client"

import * as React from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	IconEdit,
	IconEye,
	IconPlus,
	IconSearch,
	IconTrash,
	IconCheck,
	IconInfoCircle,
	IconLoader2,
} from "@tabler/icons-react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const inventorySchema = z.object({
	id: z.number(),
	name: z.string(),
	category: z.string(),
	quantity: z.number(),
	price: z.number(),
	status: z.enum(["In Stock", "Low Stock", "Out of Stock"]),
	lastUpdated: z.string(),
})

type InventoryItem = z.infer<typeof inventorySchema>

export function InventoryDataTable({
	data,
	onRefresh,
}: {
	data: InventoryItem[]
	onRefresh: () => void
}) {
	const [searchQuery, setSearchQuery] = useState("")
	const [editRowId, setEditRowId] = useState<string | null>(null)
	const [editQuantity, setEditQuantity] = useState<number | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [deleteRowId, setDeleteRowId] = useState<string | null>(null)
	const [showDetail, setShowDetail] = useState<InventoryItem | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const router = useRouter()

	// Ensure data is an array and not undefined
	const safeData = Array.isArray(data) ? data : []

	// Filter data based on search query with null safety
	const filteredData = safeData.filter((item) => {
		// Skip filtering if search query is empty
		if (!searchQuery) return true

		// Safely check string properties with null/undefined handling
		const nameMatch =
			item.name && typeof item.name === "string"
				? item.name.toLowerCase().includes(searchQuery.toLowerCase())
				: false

		const categoryMatch =
			item.category && typeof item.category === "string"
				? item.category.toLowerCase().includes(searchQuery.toLowerCase())
				: false

		return nameMatch || categoryMatch
	})

	// Update quantity API (modal)
	const handleSaveQuantity = async () => {
		if (!editRowId || editQuantity == null) return
		setIsSaving(true)
		try {
			const token = localStorage.getItem("token")
			const res = await fetch(`${API_URL}/inventory/${editRowId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ quantity: editQuantity }),
			})
			if (!res.ok) throw new Error("Gagal update quantity")
			toast.success("Quantity berhasil diupdate!")
			setShowEditModal(false)
			setEditRowId(null)
			setEditQuantity(null)
			onRefresh()
		} catch (e) {
			toast.error("Gagal update quantity")
		} finally {
			setIsSaving(false)
		}
	}

	// Delete API
	const handleDelete = async (id: string) => {
		setIsDeleting(true)
		try {
			const token = localStorage.getItem("token")
			const res = await fetch(`${API_URL}/inventory/${id}`, {
				method: "DELETE",
				headers: {
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			})
			if (res.status === 403) {
				toast.error("Akses ditolak. Hanya admin yang dapat menghapus item.")
				return
			}
			if (!res.ok) throw new Error("Gagal menghapus item")
			toast.success("Item berhasil dihapus!")
			setDeleteRowId(null)
			onRefresh()
		} catch (e) {
			toast.error("Gagal menghapus item")
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="relative flex-1 min-w-[240px]">
					<IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search inventory..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Button onClick={() => router.push("/inventory/add")}>
					<IconPlus className="mr-2 h-4 w-4" />
					Add Item
				</Button>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Last Updated</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredData.length > 0 ? (
							filteredData.map((item) => (
								<TableRow key={item.id}>
									<TableCell className="font-medium">{item.name}</TableCell>
									<TableCell>{item.category}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>${item.price?.toFixed(2) || "0.00"}</TableCell>
									<TableCell>
										<Badge
											variant={
												item.status === "In Stock"
													? "default"
													: item.status === "Low Stock"
													? "secondary"
													: "destructive"
											}
										>
											{item.status}
										</Badge>
									</TableCell>
									<TableCell>{item.lastUpdated}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												style={{ color: "#2563eb" }}
												onClick={() => setShowDetail(item)}
											>
												<IconInfoCircle className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												style={{ color: "#f59e42" }}
												onClick={() => {
													setEditRowId(String(item.id))
													setEditQuantity(item.quantity)
													setShowEditModal(true)
												}}
											>
												<IconEdit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												style={{ color: "#ef4444" }}
												onClick={() => setDeleteRowId(String(item.id))}
											>
												<IconTrash className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									{searchQuery
										? "No matching items found."
										: "No items available."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Modal Edit Quantity */}
			<Dialog
				open={showEditModal}
				onOpenChange={(open) => {
					if (!open) setShowEditModal(false)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Quantity</DialogTitle>
					</DialogHeader>
					<Input
						type="number"
						value={editQuantity ?? 0}
						onChange={(e) => setEditQuantity(Number(e.target.value))}
						min={0}
						className="w-32"
					/>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowEditModal(false)
								setEditRowId(null)
								setEditQuantity(null)
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSaveQuantity}
							disabled={isSaving || editQuantity == null}
							style={{ background: "#22c55e", color: "white" }}
						>
							{isSaving ? (
								<IconLoader2 className="animate-spin h-4 w-4" />
							) : (
								"Save"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!deleteRowId}
				onOpenChange={(open) => {
					if (!open) setDeleteRowId(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Konfirmasi Hapus</DialogTitle>
					</DialogHeader>
					<p>
						Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat
						dibatalkan.
					</p>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteRowId(null)}>
							Batal
						</Button>
						<Button
							className="text-white"
							variant="destructive"
							onClick={() => handleDelete(deleteRowId!)}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<IconLoader2 className="animate-spin h-4 w-4" />
							) : (
								"Hapus"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!showDetail}
				onOpenChange={(open) => {
					if (!open) setShowDetail(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Detail Item</DialogTitle>
					</DialogHeader>
					{showDetail && (
						<div className="space-y-2">
							<p>
								<b>Nama:</b> {showDetail.name}
							</p>
							<p>
								<b>Kategori:</b> {showDetail.category}
							</p>
							<p>
								<b>Quantity:</b> {showDetail.quantity}
							</p>
							<p>
								<b>Status:</b> {showDetail.status}
							</p>
							<p>
								<b>Last Updated:</b> {showDetail.lastUpdated}
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
