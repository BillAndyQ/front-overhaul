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
import { usePersistedColumnOrder } from "@/hooks/use-persisted-column-order"
import type { Servicio } from "@/lib/data"
import { type ColumnActions, getColumns } from "./columns"
import { DraggableHeader } from "./draggable-header"

const STORAGE_KEY = "servicios-table-column-order"

interface ServiciosTableProps extends ColumnActions {
  data: Servicio[]
}

export function ServiciosTable({ data, onEdit, onDelete }: ServiciosTableProps) {
  const columns = useMemo(() => getColumns({ onEdit, onDelete }), [onEdit, onDelete])

  // Generamos el orden por defecto
  const defaultOrder = useMemo(() => columns.map((c) => c.id as string), [columns])

  // Identificamos de manera dinámica los últimos 3 elementos para bloquearlos de por vida
  const fixedIds = useMemo(() => defaultOrder.slice(-3), [defaultOrder])

  const [columnOrder, setColumnOrder] = usePersistedColumnOrder(STORAGE_KEY, defaultOrder)

  // Aseguramos que el estado inicial y cualquier actualización siempre mantenga los 3 fijos estrictamente al final
  const safeColumnOrder = useMemo(() => {
    const activeOrder = columnOrder.filter((id) => !fixedIds.includes(id))
    return [...activeOrder, ...fixedIds]
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

    // Si se intenta mover un fijo, o soltar algo en la posición de un fijo, se cancela la acción inmediatamente
    if (fixedIds.includes(activeId) || fixedIds.includes(overId)) return

    setColumnOrder((prev: ColumnOrderState) => {
      // Trabajamos solo con las columnas móviles para evitar romper índices con los fijos
      const movableColumns = prev.filter((id) => !fixedIds.includes(id))
      
      const oldIndex = movableColumns.indexOf(activeId)
      const newIndex = movableColumns.indexOf(overId)
      
      if (oldIndex === -1 || newIndex === -1) return prev

      const movedMovable = arrayMove(movableColumns, oldIndex, newIndex)
      
      // Retornamos las móviles ordenadas y volvemos a clavar las 3 fijas al final
      return [...movedMovable, ...fixedIds]
    })
  }

  // Solo los elementos que NO pertenezcan a los 3 últimos se registran en dnd-kit como "arrastrables"
  const sortableIds = useMemo(
    () => safeColumnOrder.filter((id) => !fixedIds.includes(id)),
    [safeColumnOrder, fixedIds],
  )

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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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