"use client"
import { useCallback, useEffect, useState } from 'react';
import { AllServicesView } from './components/AllServicesView';
import { ChromeTabBar } from './components/ChromeTabBar';
import { ConfigurationView } from './components/ConfigurationView';
import { DocumentModal } from './components/DocumentModal';
import { InboxView } from './components/InboxView';
import { ServiceCreateView } from './components/ServiceCreateView';
import { ServiceDossierView } from './components/ServiceDossierView';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { TopHeader } from './components/TopHeader';
import { WorkspacePanels } from './components/WorkspacePanels';
import { INITIAL_SERVICES } from './data/mockData';
import * as api from './services/api';
import { CommercialDocItem, CorreoItem, DocumentFile, DominioEmailAnalisisIA, ServicioApiItem, TabItem, ToastItem } from './types';

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Error desconocido');

export default function App() {
  const [services, setServices] = useState(INITIAL_SERVICES);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([
    {
      id: 'initial-toast',
      message: 'Expediente COR-001 cargado correctamente',
      type: 'success',
    },
  ]);

  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [domains, setDomains] = useState<DominioEmailAnalisisIA[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);

  const [emails, setEmails] = useState<CorreoItem[]>([]);

  useEffect(() => {
    api
      .listarCorreos()
      .then(setEmails)
      .catch((err) => {
        console.error('Error al obtener los correos:', err);
      });
  }, []);

  const [apiServicios, setApiServicios] = useState<ServicioApiItem[]>([]);
  const [apiServiciosLoading, setApiServiciosLoading] = useState(true);

  useEffect(() => {
    api
      .listarServicios()
      .then(setApiServicios)
      .catch((err) => showToast(`No se pudieron cargar los servicios: ${errorMessage(err)}`, 'warning'))
      .finally(() => setApiServiciosLoading(false));
  }, [showToast]);

  // Carga inicial de dominios (domainsLoading arranca en true)
  useEffect(() => {
    api
      .listarDominios()
      .then(setDomains)
      .catch((err) =>
        showToast(`No se pudieron cargar los dominios: ${errorMessage(err)}`, 'warning')
      )
      .finally(() => setDomainsLoading(false));
  }, [showToast]);

  // Tab definitions matching the prompt & screenshot
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: 'inbox',
      label: 'Bandeja de Correos',
      type: 'inbox',
      badge: 12,
      closable: false,
    },
    {
      id: 'all-services',
      label: 'Servicios (Todos)',
      type: 'all-services',
      badge: 5,
      closable: false,
    },
    // {
    //   id: 'COR-001',
    //   label: 'COR-001',
    //   refCode: 'COR-001',
    //   sublabel: 'Solicitud APE-980',
    //   type: 'email-dossier',
    //   closable: true,
    // },
    // {
    //   id: 'direct-SRV-103',
    //   label: 'SRV-103',
    //   refCode: 'SRV-103',
    //   sublabel: 'Transporte de Carga Crítica',
    //   type: 'service-dossier',
    //   closable: true,
    // },
  ]);

  // Current active tab: default to COR-001 as in screenshot!
  // const [activeTabId, setActiveTabId] = useState<string>('COR-001');
  const [activeTabId, setActiveTabId] = useState<string>('inbox');

  // Active email dossier id
  const [activeEmailId, setActiveEmailId] = useState<string>('');
  // const [activeEmailId, setActiveEmailId] = useState<string>('COR-001');

  // Active service code
  // const [activeServiceCode, setActiveServiceCode] = useState<string>('SRV-101');
  const [activeServiceCode, setActiveServiceCode] = useState<string>('');

  // Panel expansion states (matches the screenshot: card 4 unit detail is open, others can be toggled)
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    'mail-detail': false,
    'services-sel': false,
    'service-detail': false,
    'quotation-detail': false,
    'invoice-detail': false,
    'unit-detail': true, // Expanded by default in the screenshot!
    'quotation-content': true,
    'invoice-content': true,
  });

  // Document modal preview
  const [previewDoc, setPreviewDoc] = useState<{
    doc?: DocumentFile | null;
    comm?: CommercialDocItem | null;
    unitCode?: string;
  } | null>(null);

  const handleOpenEmailDossier = (emailId: string) => {
    const email = emails.find((e) => e.id_interno === emailId) || emails[0];
    setActiveEmailId(email.id_interno);

    // If tab doesn't exist, create it
    if (!tabs.some((t) => t.id === email.id_interno)) {
      setTabs((prev) => [
        ...prev,
        {
          id: email.id_interno,
          label: email.id_interno,
          refCode: email.id_interno,
          sublabel: email.asunto,
          type: 'email-dossier',
          closable: true,
        },
      ]);
    }

    setActiveTabId(email.id_interno);
    // Link first associated service
    if (email.linkedServiceIds && email.linkedServiceIds.length > 0) {
      setActiveServiceCode(email.linkedServiceIds[0]);
    }
    showToast(`Expediente ${email.id_interno} abierto`, 'info');
  };

  const handleOpenDirectService = (serviceCode: string) => {
    const srv = apiServicios.find((s) => s._id === serviceCode);
    if (!srv) {
      showToast(`No se encontró el servicio solicitado`, 'warning');
      return;
    }
    setActiveServiceCode(srv._id);

    const tabId = `direct-${srv._id}`;
    if (!tabs.some((t) => t.id === tabId)) {
      setTabs((prev) => [
        ...prev,
        {
          id: tabId,
          label: srv.servicio,
          refCode: srv.servicio,
          sublabel: srv.cliente || srv.proyecto,
          type: 'service-dossier',
          closable: true,
        },
      ]);
    }

    setActiveTabId(tabId);
    showToast(`Abierta pestaña para ${srv.servicio}`, 'success');
  };

  const handleOpenCreateService = () => {
    if (!tabs.some((t) => t.id === 'new-service')) {
      setTabs((prev) => [
        ...prev,
        {
          id: 'new-service',
          label: 'Nuevo Servicio',
          type: 'service-create',
          closable: true,
        },
      ]);
    }
    setActiveTabId('new-service');
  };

  const handleServiceCreated = (servicio: ServicioApiItem) => {
    setApiServicios((prev) => [servicio, ...prev]);
    handleCloseTab('new-service');
    setActiveTabId('all-services');
  };

  const handleUpdateService = async (id: string, cambios: api.ServicioActualizarPayload) => {
    const actualizado = await api.actualizarServicio(id, cambios);
    setApiServicios((prev) => prev.map((s) => (s._id === id ? actualizado : s)));
  };

  const handleUpdateUnidadServicio = async (servicioId: string, unidadId: string, datos: FormData) => {
    const { detalle } = await api.actualizarUnidadServicio(servicioId, unidadId, datos);
    setApiServicios((prev) =>
      prev.map((s) =>
        s._id !== servicioId
          ? s
          : {
              ...s,
              unidades: s.unidades.map((u) => (u._id === unidadId ? { ...u, detalle } : u)),
            }
      )
    );
  };

  const handleOpenSettings = () => {
    if (!tabs.some((t) => t.id === 'settings')) {
      setTabs((prev) => [
        ...prev,
        {
          id: 'settings',
          label: 'Configuración',
          type: 'settings',
          badge: domains.length,
          closable: true,
        },
      ]);
    }
    setActiveTabId('settings');
  };

  // CRUD Operations for DominiosEmailAnalisisIA (API FastAPI /dominios)
  // Las operaciones de formulario propagan el error para que el modal lo muestre.
  const handleAddDomain = async (dominio: string, activo: boolean) => {
    const created = await api.crearDominio({ dominio, activo });
    setDomains((prev) => [...prev, created]);
  };

  const handleUpdateDomain = async (id: string, dominio: string, activo: boolean) => {
    const updated = await api.reemplazarDominio(id, { dominio, activo });
    setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
  };

  const handleDeleteDomain = async (id: string) => {
    await api.eliminarDominio(id);
    setDomains((prev) => prev.filter((d) => d.id !== id));
  };

  const handleToggleDomainActive = async (id: string) => {
    const target = domains.find((d) => d.id === id);
    if (!target) return;
    const nextState = !target.activo;
    try {
      const updated = await api.actualizarDominio(id, { activo: nextState });
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast(
        `Dominio ${target.dominio} ${nextState ? 'activado' : 'pausado'} para análisis con IA`,
        nextState ? 'success' : 'info'
      );
    } catch (err) {
      showToast(`No se pudo actualizar ${target.dominio}: ${errorMessage(err)}`, 'warning');
    }
  };

  const handleReloadDomains = async () => {
    setDomainsLoading(true);
    try {
      setDomains(await api.listarDominios());
      showToast('Dominios sincronizados con el servidor', 'info');
    } catch (err) {
      showToast(`No se pudieron cargar los dominios: ${errorMessage(err)}`, 'warning');
    } finally {
      setDomainsLoading(false);
    }
  };

  const handleCloseTab = (tabId: string) => {
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      // switch to last remaining or all-services
      const last = nextTabs[nextTabs.length - 1];
      setActiveTabId(last ? last.id : 'all-services');
    }
    showToast('Pestaña cerrada', 'info');
  };

  const handleTogglePanel = (panelKey: string) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

  const handleClosePanel = (panelKey: string) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelKey]: false,
    }));
    showToast('Panel cerrado', 'info');
  };

  const handleExpandAll = () => {
    setExpandedPanels({
      'mail-detail': true,
      'services-sel': true,
      'service-detail': true,
      'quotation-detail': true,
      'invoice-detail': true,
      'unit-detail': true,
      'quotation-content': true,
      'invoice-content': true,
    });
    showToast('Todos los paneles desplegados', 'info');
  };

  const handleCollapseAll = () => {
    setExpandedPanels({
      'mail-detail': false,
      'services-sel': false,
      'service-detail': false,
      'quotation-detail': false,
      'invoice-detail': false,
      'unit-detail': false,
      'quotation-content': false,
      'invoice-content': false,
    });
    showToast('Todos los paneles colapsados', 'info');
  };

  // Determine view mode
  const isInbox = activeTabId === 'inbox';
  const isAllServices = activeTabId === 'all-services';
  const isSettings = activeTabId === 'settings';
  const isDirectService = activeTabId.startsWith('direct-');
  const isServiceCreate = activeTabId === 'new-service';
  const isEmailDossier =
    !isInbox && !isAllServices && !isDirectService && !isServiceCreate && !isSettings;

  // Active email object if in email dossier
  const currentEmail = isEmailDossier
    ? emails.find((e) => e.id_interno === activeTabId) || emails.find((e) => e.id_interno === activeEmailId) || emails[0]
    : null;

  // If in direct service, extract service code from tab id
  const effectiveServiceCode = isDirectService
    ? activeTabId.replace('direct-', '')
    : activeServiceCode;

  const currentService = services[effectiveServiceCode] || services['SRV-101'];

  // Real API service backing the direct-service dossier tab
  const currentApiService = isDirectService
    ? apiServicios.find((s) => s._id === effectiveServiceCode)
    : undefined;

  // Top header subtitle
  let topSubtitle = '| Expediente de Correo COR-001';
  if (isInbox) topSubtitle = '| Bandeja de Correos';
  else if (isAllServices) topSubtitle = '| Catálogo Maestro de Servicios';
  else if (isServiceCreate) topSubtitle = '| Registrar Nuevo Servicio';
  else if (isSettings) topSubtitle = '| Configuración de Ingesta & Dominios IA';
  else if (isDirectService)
    topSubtitle = `| Expediente de Servicio ${currentApiService?.servicio ?? effectiveServiceCode}`;
  else if (currentEmail) topSubtitle = `| Expediente de Correo ${currentEmail.id_interno}`;

  // Tab bar status text
  let tabStatusText = 'Espacio: COR-001';
  if (isInbox) tabStatusText = 'Bandeja Correos';
  else if (isAllServices) tabStatusText = 'Servicios (Todos)';
  else if (isServiceCreate) tabStatusText = 'Nuevo Servicio';
  else if (isSettings) tabStatusText = `Configuración (${domains.length} dominios)`;
  else if (isDirectService) tabStatusText = `Servicio: ${currentApiService?.servicio ?? effectiveServiceCode}`;
  else if (currentEmail) tabStatusText = `Espacio: ${currentEmail.id_interno}`;

  return (
    <div className="bg-slate-100 font-sans text-slate-800 antialiased h-screen overflow-hidden flex">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={
          isInbox ? 'inbox' : isAllServices ? 'all-services' : isSettings ? 'settings' : 'other'
        }
        onSelectNav={(nav) => {
          if (nav === 'inbox') setActiveTabId('inbox');
          if (nav === 'all-services') setActiveTabId('all-services');
          if (nav === 'settings') handleOpenSettings();
        }}
        inboxCount={12}
        servicesCount={Object.keys(services).length}
        domainsCount={domains.length}
      />

      {/* Central Work Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 min-w-0">
        {/* Top Utility Bar */}
        <TopHeader
          subtitle={topSubtitle}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onOpenSearch={() => {
            setActiveTabId('all-services');
            showToast('Navegando a catálogo para búsqueda', 'info');
          }}
        />

        {/* Chrome-Style Browser Tabs Navigation Bar */}
        <ChromeTabBar
          tabs={tabs.map((t) => (t.id === 'settings' ? { ...t, badge: domains.length } : t))}
          activeTabId={activeTabId}
          onSelectTab={(tabId) => setActiveTabId(tabId)}
          onCloseTab={handleCloseTab}
          activeStatusText={tabStatusText}
        />

        {/* MAIN VIEWS CONTAINER */}
        <div className="flex-1 overflow-hidden relative">
          {isInbox && (
            <InboxView emails={emails} domains={domains} onOpenEmailDossier={handleOpenEmailDossier} />
          )}

          {isAllServices && (
            <AllServicesView
              services={apiServicios}
              isLoading={apiServiciosLoading}
              onOpenDirectService={handleOpenDirectService}
              onCreateService={handleOpenCreateService}
              onShowToast={showToast}
            />
          )}

          {isServiceCreate && (
            <ServiceCreateView
              onCreated={handleServiceCreated}
              onCancel={() => handleCloseTab('new-service')}
              onShowToast={showToast}
            />
          )}

          {isSettings && (
            <ConfigurationView
              domains={domains}
              onAddDomain={handleAddDomain}
              onUpdateDomain={handleUpdateDomain}
              onDeleteDomain={handleDeleteDomain}
              onToggleDomainActive={handleToggleDomainActive}
              isLoading={domainsLoading}
              onReloadDomains={handleReloadDomains}
              onShowToast={showToast}
            />
          )}

          {isEmailDossier && (
            <WorkspacePanels
              email={currentEmail}
              currentService={currentService}
              allServices={services}
              onSelectService={(code) => setActiveServiceCode(code)}
              onPreviewDocument={(doc, unitCode) => {
                setPreviewDoc({ doc, unitCode });
              }}
              onPreviewCommercial={(comm) => {
                setPreviewDoc({ comm });
              }}
              onShowToast={showToast}
              expandedPanels={expandedPanels}
              onTogglePanel={handleTogglePanel}
              onClosePanel={handleClosePanel}
              isDirectServiceMode={false}
            />
          )}

          {isDirectService && (
            <ServiceDossierView
              key={effectiveServiceCode}
              service={currentApiService}
              serviceCode={effectiveServiceCode}
              expandedPanels={expandedPanels}
              onTogglePanel={handleTogglePanel}
              onClosePanel={handleClosePanel}
              onShowToast={showToast}
              onUpdateService={handleUpdateService}
              onUpdateUnidadServicio={handleUpdateUnidadServicio}
            />
          )}
        </div>
      </div>

      {/* Document Inspector Modal */}
      <DocumentModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc?.doc}
        commercialDoc={previewDoc?.comm}
        unitCode={previewDoc?.unitCode}
        serviceCode={effectiveServiceCode}
        onSignDocument={(docId) => {
          showToast('Certificado Oficial firmado y validado digitalmente', 'success');
          // Update unit document
          setServices((prev) => {
            const updated = { ...prev };
            const srv = updated[effectiveServiceCode];
            if (srv) {
              srv.units.forEach((u) => {
                const target = u.documents.find((d) => d.id === docId);
                if (target) {
                  target.status = 'Firmado y Validado';
                }
              });
            }
            return updated;
          });
          setPreviewDoc(null);
        }}
      />

      {/* Toast Feedback Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
