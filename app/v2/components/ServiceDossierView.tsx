"use client"
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  ImagePlus,
  Loader2,
  Paperclip,
  Pencil,
  Save,
  Truck,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { EmpresaItem, listarEmpresas, ServicioActualizarPayload } from '../services/api';
import { ServicioApiItem, UnidadResumen } from '../types';

const uploadUrl = (rutaLocal: string) => `/api/uploads/${rutaLocal}`;

interface ServiceDossierViewProps {
  service: ServicioApiItem | undefined;
  serviceCode: string;
  expandedPanels: Record<string, boolean>;
  onTogglePanel: (panelKey: string) => void;
  onClosePanel: (panelKey: string) => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  onUpdateService: (id: string, cambios: ServicioActualizarPayload) => Promise<void>;
  onUpdateUnidadServicio: (servicioId: string, unidadId: string, datos: FormData) => Promise<void>;
}

const TIPO_SERVICIO_OPTIONS = [
  'NDT',
  'Izaje',
  'Mantto Industrial',
  'Faraday',
  'Metrología',
  'Cálculo estructural',
];

const ESTADO_SERVICIO_OPTIONS = ['En Proceso', 'Cerrada', 'Abierta', 'Pendiente'];

const TIPO_UNIDAD_OPTIONS = [
  'Camión',
  'Grúa Movil',
  'Grúa Puente',
  'Grúa Articulada',
  'Montacargas',
];

// Si el valor guardado ya no está en la lista (dato legado), se antepone para no perderlo al editar.
const withCurrentValue = (options: string[], current?: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

const editInputCls =
  'w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 transition-colors';

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'Aprobado':
    case 'Completado':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Evaluación':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Programado':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Asignado':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

export const ServiceDossierView: React.FC<ServiceDossierViewProps> = ({
  service,
  serviceCode,
  expandedPanels,
  onTogglePanel,
  onClosePanel,
  onShowToast,
  onUpdateService,
  onUpdateUnidadServicio,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    service?.unidades[0]?._id
  );

  const [isEditingSheet, setIsEditingSheet] = useState(false);
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [sheetForm, setSheetForm] = useState({
    servicio: '',
    tipo: '',
    cliente: '',
    ruc: '',
    proyecto: '',
    estado: '',
    anotaciones: '',
  });
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [empresasLoading, setEmpresasLoading] = useState(false);

  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [unitForm, setUnitForm] = useState({
    tipo_unidad: '',
    ubicacion: '',
    tipo_servicio: '',
    inspector: '',
  });
  const [informeCampoFile, setInformeCampoFile] = useState<File | null>(null);
  const [informeFinalFile, setInformeFinalFile] = useState<File | null>(null);
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [fotosFiles, setFotosFiles] = useState<File[]>([]);

  const handleStartEditSheet = async () => {
    if (!service) return;
    setSheetForm({
      servicio: service.servicio || '',
      tipo: service.tipo || '',
      cliente: service.cliente || '',
      ruc: service.ruc || '',
      proyecto: service.proyecto || '',
      estado: service.estado || '',
      anotaciones: service.anotaciones || '',
    });
    setIsEditingSheet(true);

    if (empresas.length === 0) {
      setEmpresasLoading(true);
      try {
        setEmpresas(await listarEmpresas());
      } catch (err) {
        onShowToast(
          `No se pudieron cargar las empresas: ${err instanceof Error ? err.message : 'Error desconocido'}`,
          'warning'
        );
      } finally {
        setEmpresasLoading(false);
      }
    }
  };

  const handleSelectCliente = (razonSocial: string) => {
    const empresa = empresas.find((e) => e.razon_social === razonSocial);
    setSheetForm((prev) => ({
      ...prev,
      cliente: razonSocial,
      ruc: empresa ? empresa.ruc : prev.ruc,
    }));
  };

  const handleCancelEditSheet = () => {
    setIsEditingSheet(false);
  };

  const handleSaveSheet = async () => {
    if (!service) return;
    if (!sheetForm.servicio.trim()) {
      onShowToast('La descripción del servicio es obligatoria', 'warning');
      return;
    }
    setIsSavingSheet(true);
    try {
      await onUpdateService(service._id, {
        servicio: sheetForm.servicio.trim(),
        tipo: sheetForm.tipo || undefined,
        cliente: sheetForm.cliente.trim() || undefined,
        ruc: sheetForm.ruc.trim() || undefined,
        proyecto: sheetForm.proyecto.trim() || undefined,
        estado: sheetForm.estado || undefined,
        anotaciones: sheetForm.anotaciones.trim() || undefined,
      });
      onShowToast('Ficha técnica del servicio actualizada', 'success');
      setIsEditingSheet(false);
    } catch (err) {
      onShowToast(
        `No se pudo actualizar el servicio: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        'warning'
      );
    } finally {
      setIsSavingSheet(false);
    }
  };

  if (!service) {
    return (
      <section className="h-full overflow-y-auto p-4 md:p-6" id="viewServiceDossier">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-2xs p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No se encontró el servicio <span className="font-mono">{serviceCode}</span>.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Es posible que aún se esté cargando o que haya sido eliminado.
          </p>
        </div>
      </section>
    );
  }

  const currentUnit: UnidadResumen | undefined =
    service.unidades.find((u) => u._id === selectedUnitId) || service.unidades[0];

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    if (!expandedPanels['unit-detail']) {
      onTogglePanel('unit-detail');
    }
    onShowToast('Unidad seleccionada en panel', 'info');
    setIsEditingUnit(false);
  };

  const handleStartEditUnit = () => {
    if (!currentUnit) return;
    setUnitForm({
      tipo_unidad: currentUnit.detalle?.tipo_unidad || '',
      ubicacion: currentUnit.detalle?.ubicacion || '',
      tipo_servicio: currentUnit.detalle?.tipo_servicio || '',
      inspector: currentUnit.detalle?.inspector || '',
    });
    setInformeCampoFile(null);
    setInformeFinalFile(null);
    setCertificadoFile(null);
    setFotosFiles([]);
    setIsEditingUnit(true);
  };

  const handleCancelEditUnit = () => {
    setIsEditingUnit(false);
  };

  const handleSaveUnit = async () => {
    if (!currentUnit) return;
    setIsSavingUnit(true);
    try {
      const datos = new FormData();
      if (unitForm.tipo_unidad) datos.append('tipo_unidad', unitForm.tipo_unidad);
      if (unitForm.ubicacion.trim()) datos.append('ubicacion', unitForm.ubicacion.trim());
      if (unitForm.tipo_servicio) datos.append('tipo_servicio', unitForm.tipo_servicio);
      if (unitForm.inspector.trim()) datos.append('inspector', unitForm.inspector.trim());
      if (informeCampoFile) datos.append('informe_de_campo', informeCampoFile);
      if (informeFinalFile) datos.append('informe_final', informeFinalFile);
      if (certificadoFile) datos.append('certificado', certificadoFile);
      fotosFiles.forEach((foto) => datos.append('fotos', foto));

      await onUpdateUnidadServicio(service._id, currentUnit._id, datos);
      onShowToast('Ficha técnica de la unidad actualizada', 'success');
      setIsEditingUnit(false);
    } catch (err) {
      onShowToast(
        `No se pudo actualizar la unidad: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        'warning'
      );
    } finally {
      setIsSavingUnit(false);
    }
  };

  const isServiceDetailOpen = expandedPanels['service-detail'] ?? false;
  const isUnitDetailOpen = expandedPanels['unit-detail'] ?? true;

  return (
    <section className="h-full overflow-y-auto p-4 md:p-6" id="viewServiceDossier">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12">
        {/* ========================================================================= */}
        {/* BLOQUE PRINCIPAL: DETALLE DEL SERVICIO & UNIDADES */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
          <div
            className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            onClick={() => onTogglePanel('service-detail')}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>Detalle del Servicio &amp; Unidades</span>
                  <span className="font-mono text-[10px] text-slate-800 font-bold px-1.5 py-0.2 rounded bg-slate-200">
                    {service.codigo}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Ficha técnica del servicio asignada con selección de unidad.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              
              {isServiceDetailOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </div>

          {isServiceDetailOpen && (
            <div className="p-4 flex flex-col gap-4">
              {/* Sub-bloque 1: Ficha Técnica */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                    Ficha Técnica del Servicio
                  </span>
                  {isEditingSheet ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCancelEditSheet}
                        disabled={isSavingSheet}
                        className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-600 text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSheet}
                        disabled={isSavingSheet}
                        className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSavingSheet ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        <span>Guardar</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditSheet}
                      className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-600 text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Servicio
                        </td>
                        <td className="px-3 py-1.5 font-bold text-slate-900">
                          {isEditingSheet ? (
                            <input
                              type="text"
                              value={sheetForm.servicio}
                              onChange={(e) =>
                                setSheetForm((prev) => ({ ...prev, servicio: e.target.value }))
                              }
                              className={editInputCls}
                            />
                          ) : (
                            service.servicio
                          )}
                        </td>
                        <td className="w-28 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Tipo
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800">
                          {isEditingSheet ? (
                            <select
                              value={sheetForm.tipo}
                              onChange={(e) =>
                                setSheetForm((prev) => ({ ...prev, tipo: e.target.value }))
                              }
                              className={editInputCls}
                            >
                              <option value="">Sin especificar</option>
                              {withCurrentValue(TIPO_SERVICIO_OPTIONS, service.tipo).map((opcion) => (
                                <option key={opcion} value={opcion}>
                                  {opcion}
                                </option>
                              ))}
                            </select>
                          ) : (
                            service.tipo || '—'
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Empresa
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800">
                          {isEditingSheet ? (
                            <select
                              value={sheetForm.cliente}
                              onChange={(e) => handleSelectCliente(e.target.value)}
                              disabled={empresasLoading}
                              className={editInputCls}
                            >
                              <option value="">
                                {empresasLoading ? 'Cargando empresas…' : 'Seleccionar empresa'}
                              </option>
                              {withCurrentValue(
                                empresas.map((e) => e.razon_social),
                                service.cliente
                              ).map((nombre) => (
                                <option key={nombre} value={nombre}>
                                  {nombre}
                                </option>
                              ))}
                            </select>
                          ) : (
                            service.cliente || '—'
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Ruc
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800">
                          {isEditingSheet ? (
                            <input
                              type="text"
                              value={sheetForm.ruc}
                              onChange={(e) =>
                                setSheetForm((prev) => ({ ...prev, ruc: e.target.value }))
                              }
                              className={editInputCls}
                            />
                          ) : (
                            service.ruc || '—'
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Proyecto
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800">
                          {isEditingSheet ? (
                            <input
                              type="text"
                              value={sheetForm.proyecto}
                              onChange={(e) =>
                                setSheetForm((prev) => ({ ...prev, proyecto: e.target.value }))
                              }
                              className={editInputCls}
                            />
                          ) : (
                            service.proyecto || '—'
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        {/* <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Correo Origen
                        </td>
                        <td className="px-3 py-1.5 font-mono text-slate-700 inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {service.message_id}
                        </td> */}
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Estado
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800">
                          {isEditingSheet ? (
                            <select
                              value={sheetForm.estado}
                              onChange={(e) =>
                                setSheetForm((prev) => ({ ...prev, estado: e.target.value }))
                              }
                              className={editInputCls}
                            >
                              <option value="">Sin especificar</option>
                              {withCurrentValue(ESTADO_SERVICIO_OPTIONS, service.estado).map((opcion) => (
                                <option key={opcion} value={opcion}>
                                  {opcion}
                                </option>
                              ))}
                            </select>
                          ) : (
                            service.estado
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Creado
                        </td>
                        <td className="px-3 py-1.5 text-slate-700 inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(service.createdAt)}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider align-top">
                          Observación
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 italic text-[11px]" colSpan={3}>
                          {isEditingSheet ? (
                            <textarea
                              value={sheetForm.anotaciones}
                              onChange={(e) =>
                                setSheetForm((prev) => ({ ...prev, anotaciones: e.target.value }))
                              }
                              rows={2}
                              className={`${editInputCls} not-italic resize-none`}
                            />
                          ) : (
                            `"${service.anotaciones || 'Sin anotaciones registradas'}"`
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sub-bloque 2: Unidades Relacionadas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-700" />
                    <span className="font-mono text-[10px] uppercase text-slate-700 font-bold tracking-wider">
                      Unidades Relacionadas (Flota Asignada)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {service.unidades.length} unidades disponibles
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider text-left">
                        <th className="px-3 py-2 font-semibold">Tipo unidad</th>
                        <th className="px-3 py-2 font-semibold">Placa</th>
                        <th className="px-3 py-2 font-semibold">Ubicación</th>
                        <th className="px-3 py-2 font-semibold">Tipo Servicio</th>
                        <th className="px-3 py-2 font-semibold">Inspector</th>
                        <th className="px-3 py-2 font-semibold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {service.unidades.length > 0 ? (
                        service.unidades.map((u) => {
                          const isSelected = u._id === selectedUnitId;
                          return (
                            <tr
                              key={u._id}
                              onClick={() => handleSelectUnit(u._id)}
                              className={`hover:bg-slate-50/70 transition-colors cursor-pointer border-l-4 ${
                                isSelected
                                  ? 'bg-emerald-50/20 border-l-emerald-600'
                                  : 'border-l-transparent'
                              }`}
                            >
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">{u.detalle?.tipo_unidad || '—'}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">{u.codigo_unidad}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">{u.detalle?.ubicacion || '—'}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">{u.detalle?.tipo_servicio || '—'}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">{u.detalle?.inspector || '—'}</span>
                                </div>
                              </td>
                              
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-medium inline-flex items-center gap-1 shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectUnit(u._id);
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver Ficha</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-3 py-4 text-center text-slate-400">
                            Sin unidades asignadas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BLOQUE: DETALLE DE LA UNIDAD */}
        {/* ========================================================================= */}
        {currentUnit && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
            <div
              className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
              onClick={() => onTogglePanel('unit-detail')}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Detalle de la Unidad</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold">
                      {currentUnit.codigo_unidad}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Ficha técnica específica del vehículo asignado al servicio
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Colapsar"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200/80 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePanel('unit-detail');
                  }}
                >
                  {isUnitDetailOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                <button
                  aria-label="Cerrar panel unidad"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClosePanel('unit-detail');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isUnitDetailOpen && (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-end">
                  {isEditingUnit ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCancelEditUnit}
                        disabled={isSavingUnit}
                        className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-600 text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveUnit}
                        disabled={isSavingUnit}
                        className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSavingUnit ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        <span>Guardar</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditUnit}
                      className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-600 text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Tipo Unidad
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-900">
                          {isEditingUnit ? (
                            <select
                              value={unitForm.tipo_unidad}
                              onChange={(e) =>
                                setUnitForm((prev) => ({ ...prev, tipo_unidad: e.target.value }))
                              }
                              className={editInputCls}
                            >
                              <option value="">Sin especificar</option>
                              {withCurrentValue(TIPO_UNIDAD_OPTIONS, currentUnit.detalle?.tipo_unidad).map(
                                (opcion) => (
                                  <option key={opcion} value={opcion}>
                                    {opcion}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            currentUnit.detalle?.tipo_unidad || 'No especificado'
                          )}
                        </td>
                        <td className="w-28 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Placa
                        </td>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {currentUnit.codigo_unidad}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Ubicación
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-900">
                          {isEditingUnit ? (
                            <input
                              type="text"
                              value={unitForm.ubicacion}
                              onChange={(e) =>
                                setUnitForm((prev) => ({ ...prev, ubicacion: e.target.value }))
                              }
                              placeholder="Planta / sede"
                              className={editInputCls}
                            />
                          ) : (
                            currentUnit.detalle?.ubicacion || '—'
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Tipo Servicio
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-900">
                          {isEditingUnit ? (
                            <select
                              value={unitForm.tipo_servicio}
                              onChange={(e) =>
                                setUnitForm((prev) => ({ ...prev, tipo_servicio: e.target.value }))
                              }
                              className={editInputCls}
                            >
                              <option value="">Sin especificar</option>
                              {withCurrentValue(
                                TIPO_SERVICIO_OPTIONS,
                                currentUnit.detalle?.tipo_servicio
                              ).map((opcion) => (
                                <option key={opcion} value={opcion}>
                                  {opcion}
                                </option>
                              ))}
                            </select>
                          ) : (
                            currentUnit.detalle?.tipo_servicio || '—'
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Inspector
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-900" colSpan={3}>
                          {isEditingUnit ? (
                            <input
                              type="text"
                              value={unitForm.inspector}
                              onChange={(e) =>
                                setUnitForm((prev) => ({ ...prev, inspector: e.target.value }))
                              }
                              placeholder="Nombre del inspector"
                              className={editInputCls}
                            />
                          ) : (
                            currentUnit.detalle?.inspector || '—'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Documentación y fotos de la visita */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <div className="px-3 py-1.5 bg-slate-50/80 border-b border-slate-200 font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Documentación
                  </div>
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      {(
                        [
                          ['informe_de_campo', 'Informe de Campo', informeCampoFile, setInformeCampoFile],
                          ['informe_final', 'Informe Final', informeFinalFile, setInformeFinalFile],
                          ['certificado', 'Certificado', certificadoFile, setCertificadoFile],
                        ] as const
                      ).map(([campo, etiqueta, archivoSeleccionado, setArchivo]) => {
                        const adjuntoActual = currentUnit.detalle?.[campo];
                        return (
                          <tr key={campo} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                            <td className="w-36 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                              {etiqueta}
                            </td>
                            <td className="px-3 py-1.5">
                              {isEditingUnit ? (
                                <div className="flex flex-col gap-1">
                                  {adjuntoActual && !archivoSeleccionado && (
                                    <a
                                      href={uploadUrl(adjuntoActual.ruta_local)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-700 hover:underline inline-flex items-center gap-1"
                                    >
                                      <Paperclip className="w-3 h-3" />
                                      {adjuntoActual.nombre_original}
                                    </a>
                                  )}
                                  <input
                                    type="file"
                                    onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                                    className="text-[11px] file:mr-2 file:px-2 file:py-1 file:rounded file:border file:border-slate-300 file:bg-white file:text-slate-700 file:text-[10px] file:font-semibold file:cursor-pointer cursor-pointer"
                                  />
                                </div>
                              ) : adjuntoActual ? (
                                <a
                                  href={uploadUrl(adjuntoActual.ruta_local)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-700 hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                  {adjuntoActual.nombre_original}
                                </a>
                              ) : (
                                <span className="text-slate-400">Sin adjuntar</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider align-top">
                          Fotos
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex flex-col gap-2">
                            {(currentUnit.detalle?.fotos?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {currentUnit.detalle!.fotos!.map((foto, i) => (
                                  <a
                                    key={`${foto.ruta_local}-${i}`}
                                    href={uploadUrl(foto.ruta_local)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-14 h-14 rounded border border-slate-200 overflow-hidden bg-slate-50 shrink-0"
                                    title={foto.nombre_original}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={uploadUrl(foto.ruta_local)}
                                      alt={foto.nombre_original}
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                            {isEditingUnit ? (
                              <label className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 hover:underline cursor-pointer w-fit">
                                <ImagePlus className="w-3.5 h-3.5" />
                                <span>
                                  {fotosFiles.length > 0
                                    ? `${fotosFiles.length} foto(s) nueva(s) seleccionada(s)`
                                    : 'Agregar fotos'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => setFotosFiles(Array.from(e.target.files ?? []))}
                                  className="hidden"
                                />
                              </label>
                            ) : (
                              !currentUnit.detalle?.fotos?.length && (
                                <span className="text-slate-400">Sin fotos</span>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Barra final de trazabilidad */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span>Trazabilidad de Servicio: Ficha Técnica &gt; Flota Asignada</span>
          </div>
        </div>
      </div>
    </section>
  );
};
