"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Header, flexRender } from "@tanstack/react-table"
import { GripVertical } from "lucide-react"
import type { CSSProperties } from "react"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DraggableHeaderProps<TData> {
  header: Header<TData, unknown>
  /** Columnas fijas: no se pueden reordenar ni muestran el grip. */
  fixed?: boolean
}

export function DraggableHeader<TData>({ header, fixed = false }: DraggableHeaderProps<TData>) {
  const isDraggable = !fixed

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
    disabled: !isDraggable,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    width: header.column.id === "actions" ? 56 : undefined,
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "bg-accent")}
    >
      {header.isPlaceholder ? null : (
        <div className="flex items-center gap-1.5">
          {isDraggable && (
            <button
              type="button"
              className="-ml-1 flex cursor-grab touch-none items-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
              aria-label={`Reordenar columna ${String(header.column.columnDef.header)}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
          )}
          <span className="whitespace-nowrap">
            {flexRender(header.column.columnDef.header, header.getContext())}
          </span>
        </div>
      )}
    </TableHead>
  )
}
