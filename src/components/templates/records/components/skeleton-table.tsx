import { TableCell } from "@/components/ui/table";

export const SkeletonTable = () => (
  <>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
  </>
);