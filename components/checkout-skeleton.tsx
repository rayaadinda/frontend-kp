import { Skeleton } from "@/components/ui/skeleton"

export function CheckoutSkeleton() {
	return (
		<div className="space-y-6">
			{/* Work Order Card Skeleton */}
			<div className="rounded-lg border p-6">
				<Skeleton className="h-6 w-[200px] mb-4" />
				<Skeleton className="h-4 w-[300px] mb-6" />
				<Skeleton className="h-10 w-[250px]" />
			</div>

			{/* Search Card Skeleton */}
			<div className="rounded-lg border p-6">
				<Skeleton className="h-6 w-[200px] mb-4" />
				<Skeleton className="h-4 w-[300px] mb-6" />
				<Skeleton className="h-10 w-full mb-4" />
				<div className="flex gap-2 mb-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-8 w-[100px]" />
					))}
				</div>
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="flex items-center space-x-4">
							<Skeleton className="h-12 w-[150px]" />
							<Skeleton className="h-12 w-[250px]" />
							<Skeleton className="h-12 w-[100px]" />
							<Skeleton className="h-12 w-[100px]" />
							<Skeleton className="h-12 w-[50px]" />
						</div>
					))}
				</div>
			</div>

			{/* Cart Card Skeleton */}
			<div className="rounded-lg border p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<Skeleton className="h-6 w-[200px] mb-2" />
						<Skeleton className="h-4 w-[300px]" />
					</div>
					<Skeleton className="h-6 w-[80px]" />
				</div>
				<div className="space-y-4">
					{Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="flex items-center space-x-4">
							<Skeleton className="h-12 w-[150px]" />
							<Skeleton className="h-12 w-[250px]" />
							<Skeleton className="h-12 w-[100px]" />
							<Skeleton className="h-12 w-[50px]" />
						</div>
					))}
				</div>
				<div className="flex justify-end gap-4 mt-6">
					<Skeleton className="h-10 w-[120px]" />
					<Skeleton className="h-10 w-[150px]" />
				</div>
			</div>
		</div>
	)
}
