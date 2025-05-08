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
} from "@tabler/icons-react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

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

export function InventoryDataTable({ data }: { data: InventoryItem[] }) {
	const [searchQuery, setSearchQuery] = useState("")
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
											<Button variant="ghost" size="icon">
												<IconEye className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon">
												<IconEdit className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="icon">
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
		</div>
	)
}
