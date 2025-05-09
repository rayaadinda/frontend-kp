import { Skeleton } from "@/components/ui/skeleton"

export function ReportSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<Skeleton className="h-8 w-[200px] mb-2" />
					<Skeleton className="h-4 w-[300px]" />
				</div>
				<Skeleton className="h-10 w-[120px]" />
			</div>

			{/* Tabs Skeleton */}
			<div className="flex gap-2 mb-6">
				<Skeleton className="h-10 w-[150px]" />
				<Skeleton className="h-10 w-[150px]" />
			</div>

			{/* Filter Card Skeleton */}
			<div className="rounded-lg border p-6">
				<Skeleton className="h-6 w-[200px] mb-4" />
				<Skeleton className="h-4 w-[300px] mb-6" />
				<div className="flex gap-4">
					<Skeleton className="h-10 w-[240px]" />
					<Skeleton className="h-10 w-[180px]" />
					<Skeleton className="h-10 w-[80px]" />
				</div>
			</div>

			{/* Table Skeleton */}
			<div className="rounded-lg border">
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<div>
							<Skeleton className="h-6 w-[200px] mb-2" />
							<Skeleton className="h-4 w-[150px]" />
						</div>
					</div>
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<Skeleton className="h-12 w-[150px]" />
								<Skeleton className="h-12 w-[120px]" />
								<Skeleton className="h-12 w-[200px]" />
								<Skeleton className="h-12 w-[100px]" />
								<Skeleton className="h-12 w-[120px]" />
								<Skeleton className="h-12 w-[80px]" />
								<Skeleton className="h-12 w-[100px]" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
