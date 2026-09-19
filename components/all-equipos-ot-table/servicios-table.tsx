"use client"

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import {
  type ColumnOrderState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useExpandedRows } from "@/hooks/use-expanded-rows"
import { usePersistedColumnOrder } from "@/hooks/use-persisted-column-order"
import type { Servicio } from "@/lib/data"
import { type ColumnActionsWithExpand, getColumns } from "./columns"
import { DraggableHeader } from "./draggable-header"

const STORAGE_KEY = "servicios-table-column-order"

interface ServiciosTableProps extends ColumnActionsWithExpand {
  data: Servicio[]
}

export function ServiciosTableEquipos({ data, onEdit, onDelete }: ServiciosTableProps) {
  const { isExpanded, toggleExpanded, isMounted } = useExpandedRows()

  const columns = useMemo(
    () => getColumns({ onEdit, onDelete, onToggleExpand: toggleExpanded, expandedRows: new Set() }),
    [onEdit, onDelete, toggleExpanded],
  )

  // Orden original de las columnas
  const defaultOrder = useMemo(() => columns.map((c) => c.id as string), [columns])

  // Columna de desplegable bloqueada al inicio
  const firstFixedId = "expand"

  // Bloqueamos estrictamente los últimos 3 elementos (ej. "actions", etc.)
  const fixedIds = useMemo(() => defaultOrder.slice(-3), [defaultOrder])

  const [columnOrder, setColumnOrder] = usePersistedColumnOrder(STORAGE_KEY, defaultOrder)

  // Asegura que "expand" esté siempre primero y los últimos 3 elementos fijos al final
  const safeColumnOrder = useMemo(() => {
    const activeOrder = columnOrder.filter(
      (id) => id !== firstFixedId && !fixedIds.includes(id)
    )
    return [firstFixedId, ...activeOrder, ...fixedIds]
  }, [columnOrder, fixedIds])

  const table = useReactTable({
    data,
    columns,
    state: { columnOrder: safeColumnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Si se interactúa con el primero ("expand") o con los 3 últimos fijos, cancelamos de inmediato
    if (
      activeId === firstFixedId || 
      overId === firstFixedId || 
      fixedIds.includes(activeId) || 
      fixedIds.includes(overId)
    ) {
      return
    }

    setColumnOrder((prev: ColumnOrderState) => {
      // Trabajamos la ordenación aislando únicamente las columnas móviles (sin el primero ni los últimos 3)
      const movableColumns = prev.filter(
        (id) => id !== firstFixedId && !fixedIds.includes(id)
      )
      
      const oldIndex = movableColumns.indexOf(activeId)
      const newIndex = movableColumns.indexOf(overId)
      
      if (oldIndex === -1 || newIndex === -1) return prev

      const movedMovable = arrayMove(movableColumns, oldIndex, newIndex)
      
      // Retornamos la lista móvil reordenada encajonada entre los límites inamovibles
      return [firstFixedId, ...movedMovable, ...fixedIds]
    })
  }

  // Elementos verdaderamente válidos para arrastrar (excluyendo el primero y los 3 últimos)
  const sortableIds = useMemo(
    () => safeColumnOrder.filter((id) => id !== firstFixedId && !fixedIds.includes(id)),
    [safeColumnOrder, fixedIds],
  )

  // Agrupar filas por n_ot y filtrar visibilidad por expand
  const filteredRows = useMemo(() => {
    if (!isMounted) return []

    const allRows = table.getRowModel().rows
    const groupedByNot = new Map<string, number[]>()

    // Agrupar índices de filas por n_ot
    allRows.forEach((row, idx) => {
      const n_ot = row.original.n_ot
      if (!groupedByNot.has(n_ot)) {
        groupedByNot.set(n_ot, [])
      }
      groupedByNot.get(n_ot)!.push(idx)
    })

    const result: Array<{ type: "summary" | "detail"; rowIdx: number; n_ot: string }> = []

    for (const [n_ot, indices] of groupedByNot) {
      const expanded = isExpanded(n_ot)

      // Mostrar solo la primera fila del grupo (resumen)
      if (indices.length > 0) {
        result.push({ type: "summary", rowIdx: indices[0], n_ot })
      }

      // Mostrar filas de detalle si el grupo está expandido
      if (expanded && indices.length > 1) {
        for (let i = 1; i < indices.length; i++) {
          result.push({ type: "detail", rowIdx: indices[i], n_ot })
        }
      }
    }

    return result
  }, [table.getRowModel().rows, isExpanded, isMounted])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => (
                    <DraggableHeader key={header.id} header={header} />
                  ))}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {filteredRows.length ? (
              filteredRows.map((item) => {
                const row = table.getRowModel().rows[item.rowIdx]
                return (
                  <TableRow
                    key={`${item.n_ot}-${item.type}-${item.rowIdx}`}
                    className={item.type === "detail" ? "bg-muted/40" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  )
}