"use client"

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
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
import { Check, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2, X } from "lucide-react"
import React, { useMemo, useState } from "react"

export interface TableColumn<T> {
    key: keyof T
    header: string
    render?: (value: any, row: T) => React.ReactNode
}

interface GenericTableV3Props<T> {
    data: T[]
    columns: TableColumn<T>[]
    idKey: keyof T

    /** Columna que se usará como grupo padre (ej: n_ot) */
    groupBy?: keyof T

    /** Columna que se usará como subgrupo colapsable (ej: id_equipo) */
    collapseBy?: keyof T

    onEdit?: (row: T) => void
    onDelete?: (id: T[keyof T]) => void
}

export function GenericTableV3<T>({
    data,
    columns,
    idKey,
    groupBy = "n_ot" as keyof T,
    collapseBy = "id_equipo" as keyof T,
    onEdit,
    onDelete,
}: GenericTableV3Props<T>) {

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    // Agrupar datos
    const groupedData = useMemo(() => {
        const groups = new Map<string, any[]>()

        data.forEach(item => {
            const groupKey = String(item[groupBy] || 'Sin grupo')
            if (!groups.has(groupKey)) {
                groups.set(groupKey, [])
            }
            groups.get(groupKey)!.push(item)
        })

        return Array.from(groups.entries())
    }, [data, groupBy])

    const tableColumns = [
        ...columns.map(
            (column): ColumnDef<T> => ({
                accessorKey: column.key,
                header: column.header,
                cell: ({ row }) => {
                    const value = row.original[column.key]
                    if (column.render) {
                        return column.render(value, row.original)
                    }

                    if (typeof value === "boolean") {
                        return value
                            ? <Check className="size-4 text-green-600" />
                            : <X className="size-4 text-gray-400" />;
                    }

                    return String(value ?? "")
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
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(fullRow)}>
                                <Pencil className="mr-2 size-4" />
                                Editar
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete?.(id as T[keyof T])}
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

    const toggleGroup = (groupKey: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey)
        } else {
            newExpanded.add(groupKey)
        }
        setExpandedGroups(newExpanded)
    }

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
                    {groupedData.length ? (
                        groupedData.map(([groupKey, groupItems]) => {
                            const isExpanded = expandedGroups.has(groupKey)

                            return (
                                <React.Fragment key={groupKey}>
                                    {/* Fila de Grupo (n_ot) */}
                                    <TableRow className="bg-muted/50 hover:bg-muted/70 cursor-pointer" onClick={() => toggleGroup(groupKey)}>
                                        <TableCell colSpan={tableColumns.length} className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                                <span>{groupKey}</span>
                                                <span className="text-xs text-muted-foreground">({groupItems.length} items)</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Filas colapsables por id_equipo */}
                                    {isExpanded && groupItems.map((row) => (
                                        <TableRow key={String(row[idKey])}>
                                            {table.getRowModel().rows[0]?.getVisibleCells().map((cell, idx) => (
                                                <TableCell key={idx} style={{ fontSize: "13.5px" }} className="px-2 py-0">
                                                    {flexRender(
                                                        table.getAllColumns()[idx]?.columnDef.cell,
                                                        { row: { original: row } as Row<T>, getValue: () => row[columns[idx]?.key as keyof T] }
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                Sin resultados
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}