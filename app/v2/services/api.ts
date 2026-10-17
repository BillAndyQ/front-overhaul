import { CorreoItem, DominioEmailAnalisisIA, ServicioApiItem, UnidadServicio } from '../types';

// Debe accederse de forma literal para que Next.js lo inyecte en el bundle del navegador.
const API_URL = process.env.NEXT_PUBLIC_API_URL_v2;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('Falta configurar NEXT_PUBLIC_API_URL_v2');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  // DELETE responde 204 sin cuerpo
  if (response.status === 204) return undefined as T;
  return response.json();
}

// FastAPI responde { detail: string } o { detail: [{ msg, loc, ... }] } (errores de validación)
async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Error ${response.status}: ${response.statusText}`;
  try {
    const body = await response.json();
    if (typeof body?.detail === 'string') return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') || fallback;
    }
  } catch {
    // cuerpo no JSON
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Correos
// ---------------------------------------------------------------------------

export const listarCorreos = () => request<CorreoItem[]>('/correos');

// ---------------------------------------------------------------------------
// Servicios (colección servicios, servidos por la propia app Next.js)
// ---------------------------------------------------------------------------

async function requestLocal<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    // Si el body es FormData, se omite Content-Type para que el navegador
    // fije el boundary multipart correcto.
    const headers =
      init?.body instanceof FormData
        ? init?.headers
        : { 'Content-Type': 'application/json', ...init?.headers };
    response = await fetch(path, { ...init, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    const fallback = `Error ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      throw new Error(typeof body?.message === 'string' ? body.message : fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return response.json();
}

export const listarServicios = () => requestLocal<ServicioApiItem[]>('/api/services');

export interface ServicioPayload {
  servicio: string;
  tipo?: string;
  unidades?: string[];
  anotaciones?: string;
  estado?: string;
  message_id: string;
  cliente?: string;
  ruc?: string;
  proyecto?: string;
  message_ids_relacionados?: string[];
}

export const crearServicio = (datos: ServicioPayload) =>
  requestLocal<ServicioApiItem>('/api/services', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

export type ServicioActualizarPayload = Partial<ServicioPayload>;

export const actualizarServicio = (id: string, cambios: ServicioActualizarPayload) =>
  requestLocal<ServicioApiItem>(`/api/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  });

// Datos propios de la asignación de una unidad a un servicio puntual
// (ubicación, tipo de servicio, inspector y adjuntos de esa visita).
export const actualizarUnidadServicio = (
  servicioId: string,
  unidadId: string,
  datos: FormData
) =>
  requestLocal<{ _id: string; detalle: UnidadServicio }>(
    `/api/services/${servicioId}/unidades/${unidadId}`,
    { method: 'PATCH', body: datos }
  );

// ---------------------------------------------------------------------------
// Empresas (API v1, FastAPI en NEXT_PUBLIC_API_URL)
// ---------------------------------------------------------------------------

// Debe accederse de forma literal para que Next.js lo inyecte en el bundle del navegador.
const API_URL_EMPRESAS = process.env.NEXT_PUBLIC_API_URL;

export interface EmpresaItem {
  id: number;
  ruc: string;
  razon_social: string;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
}

export const listarEmpresas = async (): Promise<EmpresaItem[]> => {
  if (!API_URL_EMPRESAS) {
    throw new Error('Falta configurar NEXT_PUBLIC_API_URL');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL_EMPRESAS}/api/v1/empresas/`);
  } catch {
    throw new Error('No se pudo conectar con el servidor de empresas');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// ---------------------------------------------------------------------------
// Dominios (colección dominios_email_analisis_ia)
// ---------------------------------------------------------------------------

// Beanie/FastAPI puede serializar el identificador como `_id` (alias) o `id`.
type DominioRaw = Omit<DominioEmailAnalisisIA, 'id'> & { id?: string; _id?: string };

const toDominio = ({ _id, id, ...rest }: DominioRaw): DominioEmailAnalisisIA => ({
  ...rest,
  id: (id ?? _id) as string,
});

export interface DominioPayload {
  dominio: string;
  activo: boolean;
}

export const listarDominios = async (activo?: boolean) => {
  const query = activo === undefined ? '' : `?activo=${activo}`;
  const data = await request<DominioRaw[]>(`/dominios${query}`);
  return data.map(toDominio);
};

export const obtenerDominio = async (id: string) =>
  toDominio(await request<DominioRaw>(`/dominios/${id}`));

export const crearDominio = async (datos: DominioPayload) =>
  toDominio(await request<DominioRaw>('/dominios', { method: 'POST', body: JSON.stringify(datos) }));

export const reemplazarDominio = async (id: string, datos: DominioPayload) =>
  toDominio(
    await request<DominioRaw>(`/dominios/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
  );

export const actualizarDominio = async (id: string, cambios: Partial<DominioPayload>) =>
  toDominio(
    await request<DominioRaw>(`/dominios/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
  );

export const eliminarDominio = (id: string) =>
  request<void>(`/dominios/${id}`, { method: 'DELETE' });
