export interface DocumentFile {
  id: string;
  category: 'Informe Campo' | 'Informe Final' | 'Certificado Oficial' | 'Checklist' | 'Guía Despacho';
  name: string;
  size: string;
  date: string;
  status: 'Validado' | 'Cargado' | 'Firma Pendiente' | 'Firmado y Validado';
  requiresSignature?: boolean;
  signedBy?: string;
  signedAt?: string;
}

export interface DominioEmailAnalisisIA {
  id: string;
  dominio: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitItem {
  code: string;
  type: string;
  brand: string;
  operator: string;
  location: string;
  status: 'Operativo' | 'En ruta' | 'Mantenimiento';
  documents: DocumentFile[];
}

export interface CommercialDocItem {
  folio: string;
  type: 'COT' | 'FAC';
  title: string;
  date: string;
  description: string;
  subtotal: string;
  iva: string;
  amount: string;
  status: 'Aprobada' | 'Pagada' | 'En revisión';
  version?: string;
  purchaseOrder?: string;
}

export interface ServiceItem {
  code: string;
  title: string;
  type: string;
  client: string;
  project: string;
  unitsList: string[];
  quotationCode: string;
  quotationAmount: string;
  notes: string;
  status: 'Aprobado' | 'Evaluación' | 'Programado' | 'Asignado' | 'Completado';
  units: UnitItem[];
  commercialDocs: CommercialDocItem[];
}

export interface EmailItem {
  id: string;
  sender: string;
  senderCompany: string;
  subject: string;
  excerpt: string;
  fullMessage: string;
  date: string;
  time: string;
  attachmentsCount: number;
  status: 'Analizado' | 'Pendiente' | 'Procesado';
  linkedServiceIds: string[];
  validationStatus: string;
}

export interface TabItem {
  id: string;
  label: string;
  sublabel?: string;
  type: 'inbox' | 'all-services' | 'email-dossier' | 'service-dossier' | 'service-create' | 'settings';
  refCode?: string;
  badge?: string | number;
  closable?: boolean;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export interface Adjunto {
  nombre_original: string;
  ruta_local: string;
}

// Datos propios de la asignación de una unidad a un servicio puntual
// (distintos de `tipo`, que es un atributo global del vehículo en `unidades`).
export interface UnidadServicio {
  tipo_unidad?: string;
  placa?: string;
  ubicacion?: string;
  tipo_servicio?: string;
  inspector?: string;
  informe_de_campo?: Adjunto;
  informe_final?: Adjunto;
  certificado?: Adjunto;
  fotos?: Adjunto[];
}

export interface UnidadResumen {
  _id: string;
  codigo_unidad: string;
  tipo?: string;
  detalle?: UnidadServicio;
}

export interface ServicioApiItem {
  _id: string;
  servicio: string;
  codigo: string;
  tipo?: string;
  unidades: UnidadResumen[];
  anotaciones?: string;
  estado?: string;
  message_id: string;
  cliente?: string;
  ruc?: string;
  proyecto?: string;
  message_ids_relacionados: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CorreoItem{
  id_interno: string;
  asunto: string;
  de: string;
  fecha: string;
  cuerpo: string;
  analizado_ia: boolean;
  status: string;
}