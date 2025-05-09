import { Skeleton } from "@/components/ui/skeleton"

export function InventoryDataTableSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-[200px]" />
				<Skeleton className="h-8 w-[100px]" />
			</div>
			<div className="rounded-md border">
				<div className="h-[400px] p-4">
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<Skeleton className="h-12 w-[250px]" />
								<Skeleton className="h-12 w-[200px]" />
								<Skeleton className="h-12 w-[100px]" />
								<Skeleton className="h-12 w-[100px]" />
								<Skeleton className="h-12 w-[100px]" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
