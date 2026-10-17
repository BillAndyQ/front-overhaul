import { CheckCircle2, Download, FileCheck, FileText, Printer, ShieldCheck, X } from 'lucide-react';
import React from 'react';
import { CommercialDocItem, DocumentFile } from '../types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: DocumentFile | null;
  commercialDoc?: CommercialDocItem | null;
  unitCode?: string;
  serviceCode?: string;
  onSignDocument?: (docId: string) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  commercialDoc,
  unitCode,
  serviceCode,
  onSignDocument,
}) => {
  if (!isOpen) return null;

  const isCommercial = !!commercialDoc;
  const title = isCommercial ? commercialDoc.title : doc?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold font-mono tracking-tight truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 font-sans">
                {isCommercial
                  ? `Documento Comercial • ${commercialDoc.folio}`
                  : `Expediente Técnico • Unidad ${unitCode || 'General'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="w-8 h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                alert(`Iniciando descarga de ${title}`);
              }}
              className="w-8 h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Descargar archivo"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
          {/* Simulated PDF Paper */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-6 text-slate-800 text-xs">
            {/* Paper Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="font-bold text-slate-900 text-sm tracking-tight block">
                  DISPATCHCORE CERTIFICACIÓN &amp; LOGÍSTICA S.A.
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  SISTEMA INTEGRAL DE CONTROL Y EXPEDIENTES OPERATIVOS
                </span>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="font-bold text-slate-900 block">
                  {isCommercial ? commercialDoc.folio : doc?.category?.toUpperCase()}
                </span>
                <span className="text-slate-500">{isCommercial ? commercialDoc.date : doc?.date}</span>
              </div>
            </div>

            {/* Document Content Details */}
            {isCommercial ? (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                    Glosa / Resumen Comercial
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {commercialDoc.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Condición Tributaria
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {commercialDoc.type === 'COT' ? 'Propuesta Comercial Vigente' : 'Factura Electrónica Acreditada'}
                    </span>
                    {commercialDoc.purchaseOrder && (
                      <span className="font-mono text-[11px] text-slate-600 block mt-1">
                        Orden de Compra: <strong>{commercialDoc.purchaseOrder}</strong>
                      </span>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded p-3 bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Monto Total Liquidado
                    </span>
                    <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">
                      {commercialDoc.amount}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                      <span>Neto: {commercialDoc.subtotal}</span>
                      <span>•</span>
                      <span>IVA: {commercialDoc.iva}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Unidad Registrada</span>
                    <span className="font-bold text-slate-900">{unitCode || 'APE-980'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Servicio Asociado</span>
                    <span className="font-mono font-semibold text-slate-800">{serviceCode || 'SRV-101'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Tamaño Archivo</span>
                    <span className="font-mono text-slate-700">{doc?.size}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Estado Dictamen</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {doc?.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded text-slate-700 leading-relaxed text-xs">
                  <h4 className="font-bold text-slate-900 mb-1">Dictamen Técnico y Trazabilidad Operativa</h4>
                  <p>
                    Se certifica que la unidad ha sido sometida a los procedimientos de inspección de campo, cumpliendo
                    con las directrices técnicas del servicio {serviceCode} y los estándares de seguridad vial y minera vigentes.
                  </p>
                  <p className="mt-2 text-slate-500 text-[11px]">
                    Hash de Verificación SHA-256: 8f4b23a19e830c4e4029bc41d9a263889bf73216892e85a539
                  </p>
                </div>

                {/* Digital Signature Badge */}
                {doc?.status === 'Firma Pendiente' ? (
                  <div className="p-4 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-amber-900 block text-xs">Requiere Refrendo Digital</span>
                        <span className="text-[11px] text-amber-700">
                          Este certificado oficial requiere la firma digital del inspector para su validez legal.
                        </span>
                      </div>
                    </div>
                    {onSignDocument && (
                      <button
                        onClick={() => onSignDocument(doc.id)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer flex-shrink-0"
                      >
                        Firmar y Refrendar Ahora
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-900">
                        Documento Certificado con Refrendo Digital Activo
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      VERIFICADO
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            OVERSITE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
