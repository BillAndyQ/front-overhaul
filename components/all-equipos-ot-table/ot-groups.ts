/**
 * Fila plana que devuelve `GET /api/v1/ot-equipos/equipos/all`.
 * El endpoint hace un LEFT JOIN: `id` es el id de la OT (no del equipo) y las
 * OTs sin equipos llegan con los campos del equipo (`id_ot_equipo`, `placa`, ...) en null.
 */
export interface OTEquipoRow {
  id: number
  n_ot: string
  empresa: string | null
  ruc: string | null
  estado: string
  fecha_servicio: string | null
  certificadora: string | null
  registered: boolean
  deleted: boolean
  id_ot_equipo: number | null
  tipo_unidad: string | null
  placa: string | null
  tipo_servicio: string | null
}

export type OTEquipo = OTEquipoRow & { id_ot_equipo: number }

export interface OTGroup {
  id: number
  n_ot: string
  empresa: string
  ruc: string
  fecha_servicio: string
  certificadora: string
  estado: string
  registered: boolean
  equipos: OTEquipo[]
}

/** Referencia mínima a una OT para las acciones (editar, eliminar, añadir equipo). */
export interface OTRef {
  id: number | string
  n_ot: string
}

export const ESTADOS_FILTRO = ["Todos", "En Proceso", "Cerrada", "Abierta", "Pendiente"] as const
export type EstadoFiltro = (typeof ESTADOS_FILTRO)[number]

/** Una OT no registrada se muestra como "Sin Registrar", sea cual sea su estado. */
export function estadoMostrado(ot: { estado: string; registered: boolean }): string {
  return ot.registered ? ot.estado : "Sin Registrar"
}

/** Agrupa las filas planas por `n_ot` conservando el orden de aparición. */
export function groupByOT(rows: readonly OTEquipoRow[]): OTGroup[] {
  const groups = new Map<string, OTGroup>()

  for (const row of rows) {
    let group = groups.get(row.n_ot)
    if (!group) {
      group = {
        id: row.id,
        n_ot: row.n_ot,
        empresa: row.empresa ?? "",
        ruc: row.ruc ?? "",
        fecha_servicio: row.fecha_servicio ?? "",
        certificadora: row.certificadora ?? "",
        estado: row.estado,
        registered: row.registered,
        equipos: [],
      }
      groups.set(row.n_ot, group)
    }
    if (row.id_ot_equipo !== null) {
      group.equipos.push({ ...row, id_ot_equipo: row.id_ot_equipo })
    }
  }

  return [...groups.values()]
}

interface OTSearchFields {
  n_ot: string
  empresa: string | null
  ruc: string | null
  certificadora: string | null
  estado: string
  registered: boolean
}

type EquipoSearchFields = Pick<OTEquipoRow, "placa" | "tipo_unidad" | "tipo_servicio">

const includes = (value: string | null | undefined, query: string) =>
  (value ?? "").toLowerCase().includes(query)

/**
 * Predicado compartido por ambas pestañas: estado + búsqueda por OT, empresa, RUC,
 * certificadora o datos de cualquiera de sus equipos.
 */
export function createOTFilter(searchTerm: string, estado: EstadoFiltro) {
  const query = searchTerm.trim().toLowerCase()

  return (ot: OTSearchFields, equipos: readonly EquipoSearchFields[] = []): boolean => {
    if (estado !== "Todos" && estadoMostrado(ot).toLowerCase() !== estado.toLowerCase()) {
      return false
    }
    if (!query) return true

    return (
      includes(ot.n_ot, query) ||
      includes(ot.empresa, query) ||
      includes(ot.ruc, query) ||
      includes(ot.certificadora, query) ||
      equipos.some(
        (eq) =>
          includes(eq.placa, query) ||
          includes(eq.tipo_unidad, query) ||
          includes(eq.tipo_servicio, query),
      )
    )
  }
}
