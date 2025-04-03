import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Elements = {
  lenghtHeaders: number
  lengthRows: number
}

export function TableSkeleton({lenghtHeaders, lengthRows}: Elements) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: lenghtHeaders }).map((_, i) => (
            <TableHead key={i} className="sticky top-0 bg-zinc-900">
              <Skeleton className="h-6 w-30" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: lengthRows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: lenghtHeaders }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-20" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
