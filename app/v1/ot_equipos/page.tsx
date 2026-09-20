"use client"
import { getEquipos } from "@/app/services/ot-equipos.service";
import {
    ESTADOS_FILTRO,
    type EstadoFiltro,
    type OTEquipoRow,
    type OTRef,
    createOTFilter,
    groupByOT,
} from "@/components/all-equipos-ot-table/ot-groups";
import { ServiciosTableEquipos } from "@/components/all-equipos-ot-table/servicios-table";
import { ServiciosTable } from "@/components/servicios-table/servicios-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpandedRows } from "@/hooks/use-expanded-rows";
import { type Servicio } from "@/lib/data";
import axios from "axios";
import { Download, Maximize2, Minimize2, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function PageEquipos() {

    const router = useRouter();
    const [data, setData] = useState<Servicio[]>([])
    const [dataEquipos, setDataEquipos] = useState<OTEquipoRow[]>([])
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>("Todos");
    const [activeTab, setActiveTab] = useState("ordenes");
    const { isExpanded, toggleExpanded, expandAll, collapseAll } = useExpandedRows();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchDataEquipos = async () => {
        try {
            const response = await axios.get<OTEquipoRow[]>(`${API_URL}/api/v1/ot-equipos/equipos/all`)
            const datosOrdenados = response.data
                .filter((equipo) => !equipo.deleted)
                .sort((a, b) => b.id - a.id);
            setDataEquipos(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    }

    const fetchData = async () => {
        try {
            const equipos = await getEquipos();
            setData(equipos);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchDataEquipos();
    }, []);

    // Cada OT con sus equipos (los equipos viven en el endpoint equipos/all).
    const groups = useMemo(() => groupByOT(dataEquipos), [dataEquipos]);
    const groupsByOT = useMemo(() => new Map(groups.map((g) => [g.n_ot, g])), [groups]);

    // Misma búsqueda (OT, empresa, RUC, certificadora, equipos) y estado en ambas pestañas.
    const otFilter = useMemo(() => createOTFilter(searchTerm, estadoFilter), [searchTerm, estadoFilter]);

    const filteredData = useMemo(
        () => data.filter((item) => otFilter(item, groupsByOT.get(item.n_ot)?.equipos)),
        [data, groupsByOT, otFilter],
    );

    const filteredGroups = useMemo(
        () => groups.filter((group) => otFilter(group, group.equipos)),
        [groups, otFilter],
    );

    const expandableIds = useMemo(
        () => filteredGroups.filter((g) => g.equipos.length > 0).map((g) => g.n_ot),
        [filteredGroups],
    );
    const allExpanded = expandableIds.length > 0 && expandableIds.every(isExpanded);

    function clearFilters() {
        setSearchTerm("");
        setEstadoFilter("Todos");
    }

    // Editar una OT y añadirle equipos comparten pantalla: /v1/ot_equipos/[n_ot] (AddEquipoModal).
    function handleEdit(servicio: OTRef) {
        // Reemplazar por la lógica real de edición.
        router.push(`/v1/ot_equipos/${servicio.n_ot}`);
        // window.alert(`Editar: ${servicio.empresa} (${servicio.numeroOrden})`)
    }

    async function handleDelete(servicio: OTRef) {
        try {
            await axios.delete(`${API_URL}/api/v1/ot-equipos/${servicio.id}`);
            toast.success("Orden eliminada con éxito")
            setData((prev) => prev.filter((s) => s.id !== servicio.id))
            setDataEquipos((prev) => prev.filter((e) => e.n_ot !== servicio.n_ot))
        } catch (error) {
            console.error("Error al eliminar la OT:", error);
            toast.error("Error al eliminar la orden");
        }
    }

    const createOt = async () => {
        // const API_URL = process.env.NEXT_PUBLIC_API_URL;

        try {
            const response = await axios.post(`${API_URL}/api/v1/create_ot`);

            // Suponiendo que la respuesta es { "n_ot": "OM-06-2026-000003" }
            const { n_ot } = response.data;

            if (n_ot) {
                // Redirección eficiente en Next.js
                router.push(`/v1/ot_equipos/${n_ot}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error al crear la OT:", error);
            throw error;
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/ot-equipos/report/all`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ot_equipos.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Excel descargado con éxito");
        } catch (error) {
            console.error("Error al descargar el excel:", error);
            toast.error("Error al descargar el archivo");
        }
    };

    return (

        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 m-4 md:m-8">
                <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">OT Equipos</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-80 md:flex-none">
                            <Input
                                placeholder="Buscar por OT, empresa, RUC, certificadora o equipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-8"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-4" />
                                    <span className="sr-only">Limpiar búsqueda</span>
                                </button>
                            )}
                        </div>
                        <Button className="shrink-0" onClick={createOt}>+ Nueva OT</Button>
                    </div>
                </header>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <TabsList variant={"line"}>
                            <TabsTrigger value="ordenes">Ordenes Trabajo</TabsTrigger>
                            <TabsTrigger value="equipos">Equipos</TabsTrigger>
                        </TabsList>
                        <div className="flex flex-wrap items-center gap-2">
                            {activeTab === "equipos" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={expandableIds.length === 0}
                                    onClick={() => (allExpanded ? collapseAll() : expandAll(expandableIds))}
                                    title={allExpanded ? "Contraer todas las filas" : "Expandir todas las filas con equipos"}
                                >
                                    {allExpanded ? <Minimize2 /> : <Maximize2 />}
                                    {allExpanded ? "Contraer" : "Expandir"}
                                </Button>
                            )}
                            {ESTADOS_FILTRO.map((estado) => (
                                <Button
                                    key={estado}
                                    variant={estadoFilter === estado ? "secondary" : "outline"}
                                    size="sm"
                                    aria-pressed={estadoFilter === estado}
                                    onClick={() => setEstadoFilter(estado)}
                                >
                                    {estado}
                                </Button>
                            ))}
                            <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                                <Download className="mr-2 h-4 w-4" />
                                Excel
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="ordenes">
                        <ServiciosTable data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
                    </TabsContent>
                    <TabsContent value="equipos">
                        <ServiciosTableEquipos
                            groups={filteredGroups}
                            isExpanded={isExpanded}
                            onToggleExpand={toggleExpanded}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddEquipo={handleEdit}
                            onClearFilters={clearFilters}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
