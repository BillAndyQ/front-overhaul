"use client"
import { GenericTableV2 } from "@/components/generic-table-v2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { GridCellKind } from "@glideapps/glide-data-grid";
// import "@glideapps/glide-data-grid/dist/index.css";
import { GenericTableV3 } from "@/components/generic-table-v3";
import axios from "axios";
import { Download, Plus } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Factura {
    id_factura?: number;
    n_factura?: string;
    fecha_emision?: string;
    sin_igv: number;
    igv: number;
    total: number;
    detraccion?: number;
    facturo?: boolean;
    pagado?: boolean;
    pago_detraccion?: boolean;
    en_dolares?: string;
    moneda?: string;
    tipo_ot?: string;
    id_ot?: number;
    razon_social?: string;
    ruc?: string;
    created_at?: string;
    updated_at?: string;
    isHeader?: boolean;
    groupSize?: number;
}



export default function PageFacturas() {
    const router = useRouter();
    const [data, setData] = useState<Factura[]>([]);
    const [dataFacturasControl, setdataFacturasControl] = useState<Factura[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchFacturas();
        fetchFacturasControl();
    }, []);

    const fetchFacturas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/facturas`);
            const datosOrdenados = response.data
                .sort((a: any, b: any) => b.id_factura - a.id_factura);
            setData(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener las facturas:", error);
            toast.error("Error al cargar las facturas");
        }
    };

    const fetchFacturasControl = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/facturas/control/equipos`);
            const datosOrdenados = response.data
                .sort((a: any, b: any) => b.id_factura - a.id_factura);
            setdataFacturasControl(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener las facturas:", error);
            toast.error("Error al cargar las facturas");
        }
    };

    const filteredData = data.filter((item) =>
        (item.n_factura || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.razon_social || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ruc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tipo_ot || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Crear nueva factura y redirigir
    const handleCreateFactura = async () => {
        router.push(`/v1/facturas/create`);
    };

    // Editar → redirigir a la página de detalle
    const handleEdit = (factura: Factura) => {
        if (factura.n_factura) {
            router.push(`/v1/facturas/edit/${factura.n_factura}`);
        } else {
            toast.error("No se encontró el número de factura");
        }
    };

    const handleDelete = async (factura: Factura) => {
        if (!factura.n_factura) return;
        if (!confirm(`¿Eliminar la factura ${factura.n_factura}?`)) return;

        try {
            await axios.delete(`${API_URL}/api/v1/facturas/${factura.n_factura}`);
            toast.success("Factura eliminada");
            setData(prev => prev.filter(f => f.n_factura !== factura.n_factura));
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar la factura");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/facturas/report/all`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'facturas.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Excel descargado");
        } catch (error) {
            console.error("Error al descargar:", error);
            toast.error("Error al descargar el archivo");
        }
    };

    const columns = [
        { key: "n_factura", header: "N° Factura" },
        { key: "fecha_emision", header: "Fecha Emisión" },
        { key: "razon_social", header: "Razón Social" },
        { key: "ruc", header: "RUC" },
        { key: "total", header: "Total" },
        { key: "moneda", header: "Moneda" },
        { key: "facturo", header: "Facturado" },
        { key: "pagado", header: "Pagado" },
    ];

    const columns_control = [
        // Grupo 1: Datos de la OT
        { title: "", width: 50, id: "collapse" }, // ← Nueva columna de colapso (fija)
        { title: "N° OT", width: 150, group: "Orden Trabajo", id: "n_ot" },
        { title: "Empresa", width: 200, group: "Orden Trabajo", id: "empresa" },
        { title: "Ruc", width: 110, group: "Orden Trabajo", id: "ruc" },
        { title: "Area", width: 110, group: "Orden Trabajo", id: "area" },
        { title: "F. Servicio", width: 100, group: "Orden Trabajo", id: "fecha_servicio" },


        { title: "Placa", width: 110, group: "Equipo", id: "placa" },
        { title: "Tipo Unidad", width: 110, group: "Equipo", id: "tipo_unidad" },
        { title: "Tipo Servicio", width: 110, group: "Equipo", id: "tipo_servicio" },

        // Grupo 2: Datos de Facturación
        { title: "N° Factura", width: 120, group: "Facturación", id: "n_factura" },
        { title: "Sin IGV", width: 120, group: "Facturación", id: "precio_unitario" },
        { title: "IGV", width: 120, group: "Facturación", id: "igv" },
        { title: "+IGV", width: 120, group: "Facturación", id: "total_detalle" },
        { title: "Detracción", width: 120, group: "Facturación", id: "detraccion" },
        { title: "Total", width: 120, group: "Facturación", id: "total" },
        { title: "Moneda", width: 120, group: "Facturación", id: "moneda" },
        { title: "Facturo?", width: 120, group: "Facturación", id: "facturo" },
        { title: "Pagado?", width: 120, group: "Facturación", id: "pagado" },
        { title: "Pago Detracción?", width: 120, group: "Facturación", id: "pago_detraccion" },
    ];

    const columns_control_complete = [
        { key: "n_ot", header: "N° OT" },
        { key: "empresa", header: "Empresa" },
        { key: "ruc", header: "RUC" },
        { key: "area", header: "Área" },
        { key: "fecha_servicio", header: "F Servicio" },

        { key: "placa", header: "Placa" },
        { key: "tipo_unidad", header: "Tipo Unidad" },
        { key: "tipo_servicio", header: "Tipo Servicio" },


        { key: "n_factura", header: "N° Factura" },
        { key: "precio_unitario", header: "Sin IGV" },
        { key: "igv", header: "IGV" },
        { key: "total_detalle", header: "+IGV" },
        { key: "detraccion", header: "Detraccion" },
        { key: "total", header: "Total" },
        { key: "moneda", header: "Moneda" },
        { key: "facturo", header: "Facturado" },
        { key: "pagado", header: "Pagado" },
        { key: "pago_detraccion", header: "Pago Detracción?" },

        { key: "fecha_emision", header: "Fecha Emisión" },
    ];

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 m-8">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">Facturas</h1>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Buscar por N° Factura, Razón Social o RUC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-96"
                        />
                        <Button onClick={handleCreateFactura} disabled={isSubmitting}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Factura
                        </Button>
                    </div>
                </header>

                {/* <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                </div> */}

                <Tabs defaultValue="facturas_control">
                    <TabsList variant={"line"}>
                        <TabsTrigger value="facturas_control">Facturas Control</TabsTrigger>
                        <TabsTrigger value="facturas_contable">Contable</TabsTrigger>
                    </TabsList>
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                            <Download className="mr-2 h-4 w-4" />
                            Excel
                        </Button>
                    </div>
                    <TabsContent value="facturas_control">
                        <div className="">
                            <GenericTableV3
                            data={dataFacturasControl}
                            columns={columns_control_complete}
                            idKey="n_ot"
                            collapseBy="n_ot"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                        </div>
                    </TabsContent>
                    <TabsContent value="facturas_contable">
                        <GenericTableV2
                            data={filteredData}
                            columns={columns}
                            idKey="n_factura"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}