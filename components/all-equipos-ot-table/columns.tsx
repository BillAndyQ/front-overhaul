"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type OTEquipo, type OTGroup, type OTRef, estadoMostrado } from "./ot-groups"

export interface OTActions {
  onEdit?: (ot: OTRef) => void
  onDelete?: (ot: OTRef) => void
  onAddEquipo?: (ot: OTRef) => void
}

export interface OTRowContext extends OTActions {
  group: OTGroup
  isExpanded: boolean
  onToggleExpand: (n_ot: string) => void
}

export interface EquipoRowContext {
  group: OTGroup
  equipo: OTEquipo
  index: number
  onEdit?: (ot: OTRef) => void
}

// Claves en minúscula: el backend mezcla "Abierta" / "abierta".
const estadoStyles: Record<string, string> = {
  "pendiente": "bg-violet-500/10 text-violet-600",
  "abierta": "bg-blue-500/10 text-blue-600",
  "en proceso": "bg-amber-500/10 text-amber-600",
  "cerrada": "bg-emerald-500/10 text-emerald-600",
  "anulada": "bg-red-500/10 text-red-600",
  "sin registrar": "bg-slate-500/10 text-slate-600",
}

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap capitalize",
        estadoStyles[estado.toLowerCase()] ?? estadoStyles["sin registrar"],
      )}
    >
      {estado}
    </span>
  )
}

const PlacaBadge = ({ placa, strong = false }: { placa: string; strong?: boolean }) => (
  <span
    className={cn(
      "inline-block rounded border bg-background px-1.5 py-0.5 font-mono text-xs",
      strong && "border-foreground/30 px-2 font-semibold",
    )}
  >
    {placa}
  </span>
)

/** Columnas del encabezado (orden y drag & drop). El contenido de las celdas lo pintan renderOTCell / renderEquipoCell. */
export function getColumns(): ColumnDef<OTGroup>[] {
  return [
    { id: "empresa", header: "Empresa" },
    { id: "ruc", header: "RUC" },
    { id: "n_ot", header: "N° OT" },
    { id: "placa", header: "Placa" },
    { id: "tipo_unidad", header: "Tipo Unidad" },
    { id: "tipo_servicio", header: "Tipo Servicio" },
    { id: "fecha_servicio", header: "Fecha Servicio" },
    { id: "certificadora", header: "Certificadora" },
    { id: "estado", header: "Estado" },
    { id: "actions", header: () => <span className="sr-only">Acciones</span>, enableHiding: false },
  ]
}

/** Fila padre: una OT. Con un solo equipo y la fila contraída, muestra sus datos en línea. */
export function renderOTCell(columnId: string, ctx: OTRowContext): ReactNode {
  const { group, isExpanded, onToggleExpand, onEdit, onDelete, onAddEquipo } = ctx
  const total = group.equipos.length
  const inlineEquipo = total === 1 && !isExpanded ? group.equipos[0] : null

  switch (columnId) {
    case "empresa":
      return (
        <div className="flex items-center gap-2">
          {total > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-expanded={isExpanded}
              onClick={() => onToggleExpand(group.n_ot)}
            >
              <ChevronDown className={cn("size-4 transition-transform", isExpanded && "rotate-180")} />
              <span className="sr-only">{isExpanded ? "Contraer" : "Expandir"}</span>
            </Button>
          ) : (
            <span className="size-7 shrink-0" aria-hidden />
          )}
          <span className="font-semibold">{group.empresa}</span>
          {total > 1 ? (
            <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {total} equipos
            </span>
          ) : total === 1 ? (
            <span className="shrink-0 rounded-md border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              1 equipo
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground italic">Sin equipos</span>
              <button
                type="button"
                onClick={() => onAddEquipo?.(group)}
                className="text-xs text-primary transition-opacity hover:underline focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                title="Añadir equipo a esta OT"
              >
                + Añadir
              </button>
            </span>
          )}
        </div>
      )
    case "ruc":
      return <span className="font-mono text-sm tabular-nums">{group.ruc}</span>
    case "n_ot":
      return <span className="font-mono text-sm font-semibold">{group.n_ot}</span>
    case "placa":
      return inlineEquipo?.placa ? <PlacaBadge placa={inlineEquipo.placa} /> : null
    case "tipo_unidad":
      return inlineEquipo ? <span className="text-sm">{inlineEquipo.tipo_unidad}</span> : null
    case "tipo_servicio":
      return inlineEquipo ? <span className="text-sm">{inlineEquipo.tipo_servicio}</span> : null
    case "fecha_servicio":
      return inlineEquipo ? (
        <span className="tabular-nums">{inlineEquipo.fecha_servicio}</span>
      ) : null
    case "certificadora":
      return <span className="text-sm">{group.certificadora}</span>
    case "estado":
      return <EstadoBadge estado={estadoMostrado(group)} />
    case "actions":
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Abrir menú de acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(group)}>
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(group)}>
                <Trash2 className="size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    default:
      return null
  }
}

/** Fila hija: un equipo de la OT. */
export function renderEquipoCell(columnId: string, ctx: EquipoRowContext): ReactNode {
  const { group, equipo, index, onEdit } = ctx
  const isLast = index === group.equipos.length - 1

  switch (columnId) {
    case "empresa":
      return (
        <div className="flex items-center pl-9">
          <svg
            className="mr-2 size-4 shrink-0 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d={isLast ? "M9 3v9a2 2 0 002 2h10" : "M9 3v18M9 12h12"}
            />
          </svg>
          <span className="text-xs text-muted-foreground">
            Item #{index + 1} • {group.empresa}
          </span>
        </div>
      )
    case "ruc":
      return <span className="font-mono text-xs text-muted-foreground">{group.ruc}</span>
    case "n_ot":
      return <span className="font-mono text-xs text-muted-foreground">{group.n_ot}</span>
    case "placa":
      return equipo.placa ? <PlacaBadge placa={equipo.placa} strong /> : null
    case "tipo_unidad":
      return <span className="text-sm">{equipo.tipo_unidad}</span>
    case "tipo_servicio":
      return <span className="text-sm">{equipo.tipo_servicio}</span>
    case "fecha_servicio":
      return <span className="tabular-nums">{equipo.fecha_servicio}</span>
    case "actions":
      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit?.(group)}>
            <Pencil className="size-4" />
            <span className="sr-only">Editar equipo en la OT</span>
          </Button>
        </div>
      )
    default:
      return null
  }
}
