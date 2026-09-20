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
import { type ColumnOrderState, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { AlertCircle } from "lucide-react"
import { Fragment, useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePersistedColumnOrder } from "@/hooks/use-persisted-column-order"
import { type OTActions, getColumns, renderEquipoCell, renderOTCell } from "./columns"
import { DraggableHeader } from "./draggable-header"
import type { OTGroup } from "./ot-groups"

const STORAGE_KEY = "ot-equipos-table-column-order"

// La primera columna (empresa, con el chevron) y las 3 últimas (certificadora, estado, acciones) no se reordenan.
const FIRST_FIXED_ID = "empresa"

interface ServiciosTableProps extends OTActions {
  groups: OTGroup[]
  isExpanded: (n_ot: string) => boolean
  onToggleExpand: (n_ot: string) => void
  onClearFilters?: () => void
}

export function ServiciosTableEquipos({
  groups,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddEquipo,
  onClearFilters,
}: ServiciosTableProps) {
  const columns = useMemo(() => getColumns(), [])

  const defaultOrder = useMemo(() => columns.map((c) => c.id as string), [columns])
  const fixedIds = useMemo(() => defaultOrder.slice(-3), [defaultOrder])

  const [columnOrder, setColumnOrder] = usePersistedColumnOrder(STORAGE_KEY, defaultOrder)

  const isFixed = (id: string) => id === FIRST_FIXED_ID || fixedIds.includes(id)

  // Garantiza empresa siempre primero y las 3 columnas fijas siempre al final.
  const safeColumnOrder = useMemo(() => {
    const movable = columnOrder.filter((id) => id !== FIRST_FIXED_ID && !fixedIds.includes(id))
    return [FIRST_FIXED_ID, ...movable, ...fixedIds]
  }, [columnOrder, fixedIds])

  // TanStack solo gestiona encabezados y orden de columnas; las filas se pintan por grupo.
  const table = useReactTable({
    data: groups,
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
    if (isFixed(activeId) || isFixed(overId)) return

    setColumnOrder((prev: ColumnOrderState) => {
      const movable = prev.filter((id) => !isFixed(id))
      const oldIndex = movable.indexOf(activeId)
      const newIndex = movable.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return prev

      return [FIRST_FIXED_ID, ...arrayMove(movable, oldIndex, newIndex), ...fixedIds]
    })
  }

  const sortableIds = useMemo(
    () => safeColumnOrder.filter((id) => !isFixed(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeColumnOrder, fixedIds],
  )

  const orderedColumnIds = table.getVisibleLeafColumns().map((col) => col.id)
  const totalEquipos = groups.reduce((sum, group) => sum + group.equipos.length, 0)

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
      >
        <Table className="min-w-[980px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => (
                    <DraggableHeader
                      key={header.id}
                      header={header}
                      fixed={isFixed(header.column.id)}
                    />
                  ))}
                </SortableContext>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {groups.length ? (
              groups.map((group) => {
                const expanded = isExpanded(group.n_ot)
                return (
                  <Fragment key={group.n_ot}>
                    <TableRow className="group">
                      {orderedColumnIds.map((columnId) => (
                        <TableCell key={columnId}>
                          {renderOTCell(columnId, {
                            group,
                            isExpanded: expanded,
                            onToggleExpand,
                            onEdit,
                            onDelete,
                            onAddEquipo,
                          })}
                        </TableCell>
                      ))}
                    </TableRow>

                    {expanded &&
                      group.equipos.map((equipo, index) => (
                        <TableRow key={equipo.id_ot_equipo} className="bg-muted/30">
                          {orderedColumnIds.map((columnId) => (
                            <TableCell key={columnId}>
                              {renderEquipoCell(columnId, { group, equipo, index, onEdit })}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <AlertCircle className="size-6 opacity-50" />
                    <p className="text-sm font-medium">No se encontraron Órdenes de Trabajo</p>
                    <p className="text-xs">
                      Intenta con otro término de búsqueda o cambia el filtro de estado.
                    </p>
                    {onClearFilters && (
                      <Button variant="link" size="sm" onClick={onClearFilters}>
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DndContext>

      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{groups.length}</span> Órdenes de
        Trabajo <span className="opacity-70">({totalEquipos} equipos en total)</span>
      </div>
    </div>
  )
}
