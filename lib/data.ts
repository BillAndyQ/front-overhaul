export type Estado = "abierta" | "cerrada" | "En Proceso" | "Sin Registrar"  | "pendiente"

export interface Servicio {
  id: string
  empresa: string
  ruc: string
  fecha_servicio: string
  certificadora: string
  estado: Estado
  n_ot: string
  registered : boolean
}

export const servicios: Servicio[] = [
  {
    id: "1",
    empresa: "Industrias Andinas S.A.C.",
    ruc: "20512345678",
    fecha_servicio: "2025-01-15",
    certificadora: "SGS del Perú",
    estado: "Aprobado",
    n_ot: "ORD-2025-0001",
  },
  {
    id: "2",
    empresa: "Constructora del Sur E.I.R.L.",
    ruc: "20498765432",
    fechaServicio: "2025-02-03",
    certificadora: "Bureau Veritas",
    estado: "En Proceso",
    numeroOrden: "ORD-2025-0002",
  },
  {
    id: "3",
    empresa: "Agroexportadora Norte S.A.",
    ruc: "20587654321",
    fechaServicio: "2025-02-20",
    certificadora: "TÜV Rheinland",
    estado: "Pendiente",
    numeroOrden: "ORD-2025-0003",
  },
  {
    id: "4",
    empresa: "Pesquera Pacífico S.A.C.",
    ruc: "20533221144",
    fechaServicio: "2025-03-11",
    certificadora: "SGS del Perú",
    estado: "Rechazado",
    numeroOrden: "ORD-2025-0004",
  },
  {
    id: "5",
    empresa: "Textiles Unidos S.A.",
    ruc: "20566778899",
    fechaServicio: "2025-03-28",
    certificadora: "Cotecna",
    estado: "Aprobado",
    numeroOrden: "ORD-2025-0005",
  },
  {
    id: "6",
    empresa: "Minera Altiplano S.A.C.",
    ruc: "20599887766",
    fechaServicio: "2025-04-09",
    certificadora: "Bureau Veritas",
    estado: "En Proceso",
    numeroOrden: "ORD-2025-0006",
  },
  {
    id: "7",
    empresa: "Alimentos Frescos del Valle S.A.",
    ruc: "20544556677",
    fechaServicio: "2025-04-22",
    certificadora: "TÜV Rheinland",
    estado: "Pendiente",
    numeroOrden: "ORD-2025-0007",
  },
  {
    id: "8",
    empresa: "Logística Integral Perú S.A.C.",
    ruc: "20511223344",
    fechaServicio: "2025-05-05",
    certificadora: "Cotecna",
    estado: "Aprobado",
    numeroOrden: "ORD-2025-0008",
  },
]
