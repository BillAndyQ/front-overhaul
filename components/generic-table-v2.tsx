"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

import {
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react"

export interface TableColumn<T> {
  key: keyof T
  header: string
  render?: (value: any, row: T) => React.ReactNode
}

interface GenericTableV2Props<T> {
  data: T[]
  columns: TableColumn<T>[]
  idKey: keyof T

  /** ✅ En esta versión V2, onEdit recibe TODA la fila (objeto completo) */
  onEdit?: (row: T) => void

  onDelete?: (id: T[keyof T]) => void
}

export function GenericTableV2<T>({
  data,
  columns,
  idKey,
  onEdit,
  onDelete,
}: GenericTableV2Props<T>) {

  const tableColumns = [
    ...columns.map(
      (column): ColumnDef<T> => ({
        accessorKey: column.key,
        header: column.header,
        cell: ({ row }) => {
          const value = row.original[column.key];
          if (column.render) {
            return column.render(value, row.original);
          }

          if (typeof value === "boolean") {
            return value
              ? <Check className="size-4 text-green-600" />
              : <X className="size-4 text-gray-400" />;
          }
          return String(value ?? "");
        },
      })
    ),
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const id = row.original[idKey]
        const fullRow = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEdit?.(fullRow)}   // ← Devuelve toda la fila
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(fullRow)}
              >
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }
  ]

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id}>
              {group.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={String(row.original[idKey])}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={tableColumns.length}
                className="h-24 text-center"
              >
                Sin resultados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}