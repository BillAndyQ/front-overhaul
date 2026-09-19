"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Estado, Servicio } from "@/lib/data"
import { cn } from "@/lib/utils"

export interface ColumnActionsWithExpand extends ColumnActions {
  onToggleExpand?: (n_ot: string) => void
  expandedRows?: Set<string>
}

const estadoStyles: Record<Estado, string> = {
  // 1. Pendiente: Esperando validación o inicio (Morado/Violeta)
  "pendiente": "bg-violet-500/10 text-violet-600",

  // 2. Abierta: Indica que algo está iniciando o disponible (Azul)
  "abierta": "bg-blue-500/10 text-blue-600",
  
  // 3. En Proceso: Indica movimiento, requiere atención (Ámbar/Naranja)
  "En Proceso": "bg-amber-500/10 text-amber-600",
  
  // 4. Cerrada: Indica éxito o finalización (Esmeralda/Verde)
  "cerrada": "bg-emerald-500/10 text-emerald-600",
  
  // 5. Anulada: Indica que la operación fue cancelada (Rojo intenso)
  "Anulada": "bg-red-500/10 text-red-600",

  // 6. Sin Registrar: Indica ausencia de información o estado neutro (Gris/Slate)
  "Sin Registrar": "bg-slate-500/10 text-slate-600",
}

function EstadoBadge({ estado }: { estado: Estado }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        estadoStyles[estado],
      )}
    >

      {estado}
    </span>
  )
}

export interface ColumnActions {
  onEdit?: (servicio: Servicio) => void
  onDelete?: (servicio: Servicio) => void
}

export function getColumns({
  onEdit,
  onDelete,
  onToggleExpand,
  expandedRows,
}: ColumnActionsWithExpand = {}): ColumnDef<Servicio>[] {
  return [
    {
      id: "expand",
      header: () => <span className="sr-only">Expandir</span>,
      cell: ({ row }) => {
        const n_ot = row.original.n_ot
        const isExpanded = expandedRows?.has(n_ot) ?? false
        return (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onToggleExpand?.(n_ot)}
          >
            <ChevronDown
              className={cn("size-4 transition-transform", isExpanded && "rotate-180")}
            />
            <span className="sr-only">{isExpanded ? "Contraer" : "Expandir"}</span>
          </Button>
        )
      },
    },
    {
      id: "n_ot",
      accessorKey: "n_ot",
      header: "N° OT",
      cell: ({ row }) => <span className="font-mono text-sm font-semibold">{row.original.n_ot}</span>,
    },
    {
      id: "empresa",
      accessorKey: "empresa",
      header: "Empresa",
      cell: ({ row }) => <span className="font-medium">{row.original.empresa}</span>,
    },
    {
      id: "ruc",
      accessorKey: "ruc",
      header: "RUC",
      cell: ({ row }) => <span className="font-mono text-sm tabular-nums">{row.original.ruc}</span>,
    },
    {
      id: "placa",
      accessorKey: "placa",
      header: "Placa",
      cell: ({ row }) => <span className="text-sm">{row.original.placa}</span>,
    },
    {
      id: "tipo_unidad",
      accessorKey: "tipo_unidad",
      header: "Tipo Unidad",
      cell: ({ row }) => <span className="text-sm">{row.original.tipo_unidad}</span>,
    },
    {
      id: "tipo_servicio",
      accessorKey: "tipo_servicio",
      header: "Tipo Servicio",
      cell: ({ row }) => <span className="text-sm">{row.original.tipo_servicio}</span>,
    },
    // tipo_unidad
    {
      id: "fechaServicio",
      accessorKey: "fechaServicio",
      header: "Fecha Servicio",
      cell: ({ row }) => <span className="tabular-nums">{row.original.fecha_servicio}</span>,
    },
    {
      id: "certificadora",
      accessorKey: "certificadora",
      header: "Certificadora",
    },
    {
      id: "estado",
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        // Si registered es false, usamos "Sin Registrar", si no, usamos el estado real
        const estadoMostrado = row.original.registered
          ? row.original.estado
          : "Sin Registrar";

        return <EstadoBadge estado={estadoMostrado} />;
      },
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const servicio = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Abrir menú de acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(servicio)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(servicio)}>
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
