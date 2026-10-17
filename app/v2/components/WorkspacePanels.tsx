"use client"
import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  Receipt,
  ShieldCheck,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { CommercialDocItem, CorreoItem, DocumentFile, ServiceItem, UnitItem } from '../types';

interface WorkspacePanelsProps {
  email?: CorreoItem | null;
  currentService: ServiceItem;
  allServices: Record<string, ServiceItem>;
  onSelectService: (serviceCode: string) => void;
  onPreviewDocument: (doc: DocumentFile, unitCode: string) => void;
  onPreviewCommercial: (doc: CommercialDocItem) => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  expandedPanels: Record<string, boolean>;
  onTogglePanel: (panelKey: string) => void;
  onClosePanel: (panelKey: string) => void;
  isDirectServiceMode?: boolean;
}

export const WorkspacePanels: React.FC<WorkspacePanelsProps> = ({
  email,
  currentService,
  allServices,
  onSelectService,
  onPreviewDocument,
  onPreviewCommercial,
  onShowToast,
  expandedPanels,
  onTogglePanel,
  onClosePanel,
  isDirectServiceMode = false,
}) => {
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(
    currentService.units[0]?.code || 'APE-980'
  );

  // Current unit object
  const currentUnit: UnitItem =
    currentService.units.find((u) => u.code === selectedUnitCode) ||
    currentService.units[0] || {
      code: 'APE-980',
      type: 'Tracto Camión (Volvo FH 540)',
      brand: 'Volvo FH 540',
      operator: 'Carlos Mendoza R.',
      location: 'Patio Norte / Antamina',
      status: 'Operativo',
      documents: [],
    };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // simulate upload & digital signature
      onShowToast(`Archivo "${file.name}" cargado y refrendado con firma digital`, 'success');
      // Update the certificate status locally
      const certDoc = currentUnit.documents.find((d) => d.category === 'Certificado Oficial');
      if (certDoc) {
        certDoc.status = 'Firmado y Validado';
        certDoc.name = file.name;
        certDoc.size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }
    }
  };

  const handleSelectUnit = (unitCode: string) => {
    setSelectedUnitCode(unitCode);
    if (!expandedPanels['unit-detail']) {
      onTogglePanel('unit-detail');
    }
    onShowToast(`Unidad ${unitCode} seleccionada en panel`, 'info');
  };

  const isMailOpen = expandedPanels['mail-detail'] ?? false;
  const isServicesSelOpen = expandedPanels['services-sel'] ?? false;
  const isServiceDetailOpen = expandedPanels['service-detail'] ?? false;
  const isQuotationOpen = expandedPanels['quotation-detail'] ?? false;
  const isInvoiceOpen = expandedPanels['invoice-detail'] ?? false;
  const isUnitDetailOpen = expandedPanels['unit-detail'] ?? true; // expanded by default as in screenshot!

  const quotationDoc = currentService.commercialDocs.find((d) => d.type === 'COT');
  const invoiceDoc = currentService.commercialDocs.find((d) => d.type === 'FAC');

  return (
    <section className="h-full overflow-y-auto p-4 md:p-6" id="viewWorkspacePanels">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12">
        {/* Mini Breadcrumb / Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-slate-400 uppercase text-[10px]" id="wsBreadcrumbLabel">
              {isDirectServiceMode ? 'Expediente de Servicio Directo:' : 'Expediente Correo:'}
            </span>
            <span
              className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
              id="wsBadgeCode"
            >
              {isDirectServiceMode ? currentService.code : email?.id_interno || 'COR-001'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-700" id="wsBadgeSubject">
              {isDirectServiceMode ? currentService.title : email?.asunto || 'Solicitud APE-980'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
              id="wsValidationBadge"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span id="wsValidationText">
                {isDirectServiceMode ? 'Expediente de Servicio Directo' : 'Extracción IA Validada'}
              </span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 1: DETALLE DEL CORREO (SE MUESTRA SOLO EN FLUJO DE CORREO) */}
        {/* ========================================================================= */}
        {!isDirectServiceMode && email && (
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            id="card-block-mail"
          >
            <div
              className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
              onClick={() => onTogglePanel('mail-detail')}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>1. Detalle del Correo</span>
                    <span
                      className="font-mono text-[10px] text-slate-600 font-medium px-1.5 py-0.2 rounded bg-slate-200"
                      id="mailHeaderRef"
                    >
                      {email.id_interno}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Metadatos de recepción y transcripción asistida
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Analizado</span>
                </span>
                {isMailOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>

            {isMailOpen && (
              <div className="p-4 flex flex-col gap-3.5" id="block-mail-content">
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-2 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          De / Remitente
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900" id="mailDetailFrom">
                          {email.de}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Asunto
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900" id="mailDetailSubject">
                          {email.asunto}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Fecha / Hora
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-700" id="mailDetailDate">
                          {email.fecha}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Adjuntos
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {email.attachmentsCount} adjuntos vinculados
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider align-top">
                          Mensaje Original
                        </td>
                        <td className="px-3 py-2 font-sans text-slate-800 bg-slate-50/40 italic leading-relaxed">
                          "{email.cuerpo}"
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PANEL 2: SERVICIOS VINCULADOS AL CORREO (SOLO VISIBLE CUANDO VIENE DESDE CORREO) */}
        {/* ========================================================================= */}
        {!isDirectServiceMode && (
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            id="card-block-services-selector"
          >
            <div
              className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
              onClick={() => onTogglePanel('services-sel')}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      2. Servicios Vinculados al Correo
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold border border-emerald-200 leading-none">
                      {email?.linkedServiceIds?.length || 2} Disponibles
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Selecciona un servicio para explorar su ficha técnica y flota asociada
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap"
                  id="servicesSelectedCodePill"
                >
                  {currentService.code} activo
                </span>
                {isServicesSelOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>

            {isServicesSelOpen && (
              <div className="p-4" id="block-services-selector-content">
                <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs table-auto min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider text-left">
                      <tr>
                        <th className="w-12 px-3 py-2 text-center font-semibold">SEL.</th>
                        <th className="w-24 px-3 py-2 font-semibold">CÓDIGO</th>
                        <th className="px-3 py-2 font-semibold">SERVICIO</th>
                        <th className="px-3 py-2 font-semibold">CLIENTE</th>
                        <th className="w-28 px-3 py-2 font-semibold">UNIDADES</th>
                        <th className="w-28 px-3 py-2 font-semibold text-center">ESTADO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.values(allServices)
                        .filter((s) => email?.linkedServiceIds?.includes(s.code) ?? ['SRV-101', 'SRV-102'].includes(s.code))
                        .map((srv) => {
                          const isSelected = srv.code === currentService.code;
                          return (
                            <tr
                              key={srv.code}
                              onClick={() => {
                                onSelectService(srv.code);
                                onShowToast(`Servicio ${srv.code} activado`, 'info');
                              }}
                              className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                                isSelected ? 'service-row-selected' : ''
                              }`}
                            >
                              <td className="px-3 py-2.5 text-center">
                                {isSelected ? (
                                  <span className="w-4 h-4 rounded-full border-2 border-emerald-600 bg-emerald-600 inline-flex items-center justify-center text-white text-[10px] font-bold">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-300 bg-white inline-block" />
                                )}
                              </td>
                              <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                                {srv.code}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-slate-900">
                                {srv.title}
                              </td>
                              <td className="px-3 py-2.5 text-slate-700">{srv.client}</td>
                              <td className="px-3 py-2.5 font-mono">{srv.unitsList.join(', ')}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {srv.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* BLOQUE PRINCIPAL: DETALLE DEL SERVICIO & UNIDADES */}
        {/* ========================================================================= */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
          id="card-block-service-detail"
        >
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
                  <span id="srvDetailSectionTitle">Detalle del Servicio &amp; Unidades</span>
                  <span
                    className="font-mono text-[10px] text-slate-800 font-bold px-1.5 py-0.2 rounded bg-slate-200"
                    id="srvDetailCodeBadge"
                  >
                    {currentService.code}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Ficha técnica del servicio y flota asignada con selección de unidad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                id="srvDetailStatusBadge"
              >
                {currentService.status} / Proceder
              </span>
              {isServiceDetailOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </div>

          {isServiceDetailOpen && (
            <div className="p-4 flex flex-col gap-4" id="block-service-detail-content">
              {/* Sub-bloque 1: Ficha Técnica */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                    Ficha Técnica del Servicio
                  </span>
                  <span className="text-[10px] font-mono text-slate-500" id="srvDetailOriginBadge">
                    Expediente ID: <strong className="text-slate-800">{currentService.code}</strong>
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Servicio
                        </td>
                        <td className="px-3 py-1.5 font-bold text-slate-900" id="srvDetailTitle">
                          {currentService.title}
                        </td>
                        <td className="w-28 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Tipo
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800" id="srvDetailType">
                          {currentService.type}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Cliente
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800" id="srvDetailClient">
                          {currentService.client}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Proyecto
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-800" id="srvDetailProject">
                          {currentService.project}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider align-top">
                          Observación
                        </td>
                        <td
                          className="px-3 py-1.5 text-slate-600 italic text-[11px]"
                          colSpan={3}
                          id="srvDetailNotes"
                        >
                          "{currentService.notes}"
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
                  <span
                    className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold"
                    id="srvUnitsCount"
                  >
                    {currentService.units.length} unidades disponibles
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider text-left">
                        <th className="px-3 py-2 font-semibold">Unidad / Tipo</th>
                        <th className="px-3 py-2 font-semibold">Operador Encargado</th>
                        <th className="px-3 py-2 font-semibold">Ubicación Actual</th>
                        <th className="px-3 py-2 font-semibold text-center">Estado</th>
                        <th className="px-3 py-2 font-semibold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100" id="srvUnitsList">
                      {currentService.units.map((u) => {
                        const isSelected = u.code === selectedUnitCode;
                        return (
                          <tr
                            key={u.code}
                            id={`unit-row-${u.code}`}
                            onClick={() => handleSelectUnit(u.code)}
                            className={`hover:bg-slate-50/70 transition-colors cursor-pointer border-l-4 ${
                              isSelected
                                ? 'bg-emerald-50/20 border-l-emerald-600'
                                : 'border-l-transparent'
                            }`}
                          >
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                                  {u.code}
                                </span>
                                <div>
                                  <span className="text-xs font-semibold text-slate-800 block leading-tight">
                                    {u.brand}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-sans">{u.type}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-medium text-slate-800">{u.operator}</td>
                            <td className="px-3 py-2.5 text-slate-600 font-sans">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {u.location}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {u.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-medium inline-flex items-center gap-1 shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectUnit(u.code);
                                }}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Ficha y Docs</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sub-bloque 3: Cotizaciones y Facturas Relacionadas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-slate-700" />
                    <span className="font-mono text-[10px] uppercase text-slate-700 font-bold tracking-wider">
                      Cotizaciones y Facturas Relacionadas
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {currentService.commercialDocs.length} documentos comerciales
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider text-left">
                        <th className="px-3 py-2 font-semibold">Tipo / Folio</th>
                        <th className="px-3 py-2 font-semibold">Fecha Emisión</th>
                        <th className="px-3 py-2 font-semibold">Glosa / Descripción</th>
                        <th className="px-3 py-2 font-semibold text-right">Monto Total</th>
                        <th className="px-3 py-2 font-semibold text-center">Estado</th>
                        <th className="px-3 py-2 font-semibold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentService.commercialDocs.map((cDoc) => (
                        <tr
                          key={cDoc.folio}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => {
                            if (cDoc.type === 'COT') {
                              if (!expandedPanels['quotation-detail']) onTogglePanel('quotation-detail');
                            } else {
                              if (!expandedPanels['invoice-detail']) onTogglePanel('invoice-detail');
                            }
                          }}
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${
                                  cDoc.type === 'COT'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {cDoc.type}
                              </span>
                              <div>
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {cDoc.folio}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {cDoc.version || (cDoc.purchaseOrder ? `OC: ${cDoc.purchaseOrder}` : '')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-600 text-xs">
                            {cDoc.date}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 text-xs font-medium">
                            <span className="block truncate max-w-[220px]">{cDoc.title}</span>
                          </td>
                          <td className="px-3 py-2.5 font-mono font-bold text-slate-900 text-xs text-right">
                            {cDoc.amount}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {cDoc.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cDoc.type === 'COT') {
                                    if (!expandedPanels['quotation-detail']) onTogglePanel('quotation-detail');
                                  } else {
                                    if (!expandedPanels['invoice-detail']) onTogglePanel('invoice-detail');
                                  }
                                  onPreviewCommercial(cDoc);
                                }}
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ver Detalle</span>
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShowToast(`Descargando ${cDoc.folio}.pdf`, 'info');
                                }}
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BLOQUE: DETALLE DE COTIZACIÓN (COLAPSABLE Y CON CIERRE) */}
        {/* ========================================================================= */}
        {isQuotationOpen && quotationDoc && (
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            id="card-block-quotation-detail"
          >
            <div
              className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
              onClick={() => onTogglePanel('quotation-content')}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Detalle de Cotización</span>
                    <span
                      className="font-mono text-[10px] text-blue-800 font-bold px-1.5 py-0.2 rounded bg-blue-100 border border-blue-200"
                      id="quotationFolioBadge"
                    >
                      {quotationDoc.folio}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Condiciones comerciales, desglose arancelario y estado de aprobación
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <BadgeCheck className="w-3 h-3 text-emerald-700" />
                  <span>Aprobada</span>
                </span>
                <button
                  aria-label="Colapsar"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200/80 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePanel('quotation-content');
                  }}
                >
                  {expandedPanels['quotation-content'] ?? true ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                <button
                  aria-label="Cerrar panel cotización"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClosePanel('quotation-detail');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(expandedPanels['quotation-content'] ?? true) && (
              <div className="p-4 flex flex-col gap-3.5" id="block-quotation-content">
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Folio Cotización
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                            {quotationDoc.folio}
                          </span>
                        </td>
                        <td className="w-28 px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Versión
                        </td>
                        <td className="px-3 py-2 text-slate-800 font-medium">
                          {quotationDoc.version}{' '}
                          <span className="text-emerald-700 text-[11px] font-medium">
                            (Aprobada por cliente)
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Cliente
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900">
                          {currentService.client}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Validez
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-700">
                          {quotationDoc.date} (Vigente)
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Desglose Montos
                        </td>
                        <td className="px-3 py-2" colSpan={3}>
                          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                            <span className="text-slate-600">
                              Subtotal: <strong>{quotationDoc.subtotal}</strong>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-600">
                              IVA (19%): <strong>{quotationDoc.iva}</strong>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                              Total: {quotationDoc.amount}
                            </span>
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

        {/* ========================================================================= */}
        {/* BLOQUE: DETALLE DE FACTURA (COLAPSABLE Y CON CIERRE) */}
        {/* ========================================================================= */}
        {isInvoiceOpen && invoiceDoc && (
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            id="card-block-invoice-detail"
          >
            <div
              className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
              onClick={() => onTogglePanel('invoice-content')}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Detalle de Factura</span>
                    <span className="font-mono text-[10px] text-emerald-800 font-bold px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-200">
                      {invoiceDoc.folio}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Facturación electrónica, acreditación tributaria y conciliación de pagos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Pagada / Conciliada</span>
                </span>
                <button
                  aria-label="Colapsar"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200/80 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePanel('invoice-content');
                  }}
                >
                  {expandedPanels['invoice-content'] ?? true ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                <button
                  aria-label="Cerrar panel factura"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClosePanel('invoice-detail');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(expandedPanels['invoice-content'] ?? true) && (
              <div className="p-4 flex flex-col gap-3.5" id="block-invoice-content">
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          N° Factura
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                            {invoiceDoc.folio}
                          </span>
                        </td>
                        <td className="w-28 px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Orden Compra
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold text-slate-800">
                          {invoiceDoc.purchaseOrder || 'OC-2026-9811'}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Total Facturado
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-emerald-700" colSpan={3}>
                          {invoiceDoc.amount} (Anticipo 50% Conciliado)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* BLOQUE: DETALLE DE LA UNIDAD & DOCUMENTOS ADJUNTOS (CENTERPIECE EN EL SCREENSHOT) */}
        {/* ========================================================================= */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
          id="card-block-unit-detail"
        >
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
                  <span>Detalle de la Unidad &amp; Documentos Adjuntos</span>
                  <span
                    className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold"
                    id="unitBadgeCode"
                  >
                    {currentUnit.code}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Ficha técnica específica del vehículo y expediente documental vinculado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                id="unitStatusBadge"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span id="unitStatusText">{currentUnit.status}</span>
              </span>
              <button
                aria-label="Colapsar"
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200/80 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePanel('unit-detail');
                }}
              >
                {isUnitDetailOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" id="chevron-unit-detail" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" id="chevron-unit-detail" />
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
            <div className="p-4 flex flex-col gap-4" id="block-unit-detail-content">
              {/* Ficha Clave : Valor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                    Ficha Técnica de Unidad
                  </span>
                  <span
                    className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.2 rounded border border-slate-200"
                    id="unitSourceServiceBadge"
                  >
                    Servicio {currentService.code}
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="w-36 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Tipo Unidad
                        </td>
                        <td className="px-3 py-1.5 font-medium text-slate-900" id="unitFieldType">
                          {currentUnit.type}
                        </td>
                        <td className="w-28 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Placa / Patente
                        </td>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900">
                          <span
                            className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                            id="unitFieldPlate"
                          >
                            {currentUnit.code}
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Ubicación
                        </td>
                        <td className="px-3 py-1.5 text-slate-800" id="unitFieldLocation">
                          {currentUnit.location}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50/80 border-r border-slate-100 uppercase tracking-wider">
                          Inspector Resp.
                        </td>
                        <td
                          className="px-3 py-1.5 text-slate-800 font-medium"
                          id="unitFieldInspector"
                        >
                          {currentUnit.operator}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Archivos y Documentos Adjuntos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="font-mono text-[10px] uppercase text-slate-700 font-bold tracking-wider">
                      Archivos y Documentos Adjuntos
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {currentUnit.documents.length} archivos vinculados
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentUnit.documents.map((doc) => {
                    const isCert = doc.category === 'Certificado Oficial';
                    const isPendingSign = doc.status === 'Firma Pendiente';

                    if (isCert && isPendingSign) {
                      return (
                        <div
                          key={doc.id}
                          className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-lg p-3 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] uppercase text-amber-800 font-bold">
                                {doc.category}
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                Firma Pendiente
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
                              <div className="min-w-0">
                                <span
                                  className="font-semibold text-slate-800 text-xs truncate block"
                                  id="docItem3Name"
                                >
                                  {doc.name}
                                </span>
                                <span className="text-[10px] text-amber-700 font-mono">
                                  Requiere refrendo digital
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                            <span className="text-[10px] text-amber-800 font-mono">
                              Subir firmado:
                            </span>
                            <label className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Subir</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={doc.id}
                        className="border border-slate-200 rounded-lg p-3 bg-white shadow-2xs flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] uppercase text-slate-400 font-bold">
                              {doc.category}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {doc.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 text-xs truncate block">
                                {doc.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {doc.size} • {doc.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                          <button
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                            onClick={() => onPreviewDocument(doc, currentUnit.code)}
                          >
                            Ver
                          </button>
                          <button
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                            onClick={() => onShowToast(`Descargando ${doc.name}...`, 'info')}
                          >
                            Descargar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra final de acciones del expediente */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span id="footerTraceabilityLabel">
              Trazabilidad de Servicio: Ficha Técnica &gt; Flota Asignada &gt; Documentos Comerciales &gt; Certificación
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
