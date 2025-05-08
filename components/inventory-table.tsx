"use client"

import { useState } from "react"
import { z } from "zod"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"

export const inventorySchema = z.object({
	id: z.string(),
	name: z.string(),
	quantity: z.number(),
	price: z.number(),
	description: z.string().optional(),
	lastUpdated: z.date(),
	status: z.enum(["In Stock", "Low Stock", "Out of Stock"]),
})

type InventoryItem = z.infer<typeof inventorySchema>

const mockData: InventoryItem[] = [
	{
		id: "1",
		name: "Laptop",
		quantity: 10,
		price: 999.99,
		description: "High-performance laptop",
		lastUpdated: new Date(),
		status: "In Stock",
	},
	{
		id: "2",
		name: "Mouse",
		quantity: 25,
		price: 29.99,
		description: "Wireless mouse",
		lastUpdated: new Date(),
		status: "In Stock",
	},
	{
		id: "3",
		name: "Keyboard",
		quantity: 5,
		price: 79.99,
		description: "Mechanical keyboard",
		lastUpdated: new Date(),
		status: "Low Stock",
	},
]

export function InventoryTable() {
	const [data, setData] = useState<InventoryItem[]>(mockData)

	const handleDelete = (id: string) => {
		setData(data.filter((item) => item.id !== id))
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Last Updated</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="font-medium">{item.name}</TableCell>
							<TableCell>{item.quantity}</TableCell>
							<TableCell>${item.price.toFixed(2)}</TableCell>
							<TableCell>
								<span
									className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
										item.status === "In Stock"
											? "bg-green-100 text-green-800"
											: item.status === "Low Stock"
											? "bg-yellow-100 text-yellow-800"
											: "bg-red-100 text-red-800"
									}`}
								>
									{item.status}
								</span>
							</TableCell>
							<TableCell>{item.lastUpdated.toLocaleDateString()}</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button variant="ghost" size="icon">
										<Eye className="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon">
										<Edit className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(item.id)}
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
	)
}
