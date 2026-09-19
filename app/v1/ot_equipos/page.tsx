"use client"
import { getEquipos } from "@/app/services/ot-equipos.service";
import { ServiciosTableEquipos } from "@/components/all-equipos-ot-table/servicios-table";
import { ServiciosTable } from "@/components/servicios-table/servicios-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Servicio } from "@/lib/data";
import axios from "axios";
import { Download } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function pageEquipos() {

    const router = useRouter();
    const [data, setData] = useState<Servicio[]>([])
    const [dataEquipos, setDataEquipos] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchDataEquipos = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/ot-equipos/equipos/all`)
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

    const filteredData = data.filter((item) =>
        (item.n_ot || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.empresa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.certificadora || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDataEquipos = dataEquipos.filter((item: any) =>
        (item.n_ot || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.empresa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.certificadora || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.placa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tipo_unidad || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tipo_servicio || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    function handleEdit(servicio: Servicio) {
        // Reemplazar por la lógica real de edición.
        router.push(`/v1/ot_equipos/${servicio.n_ot}`);
        // window.alert(`Editar: ${servicio.empresa} (${servicio.numeroOrden})`)
    }

    async function handleDelete(servicio: Servicio) {
        const response = await axios.delete(`${API_URL}/api/v1/ot-equipos/${servicio.id}`);
        toast.success("Orden eliminada con éxito")
        setData((prev) => prev.filter((s) => s.id !== servicio.id))
    }

    const createOt = async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
            <div className="@container/main flex flex-1 flex-col gap-2 m-8">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">OT Equipos</h1>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Buscar por OT, empresa o certificadora..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        <Button onClick={createOt}>+ Nueva OT</Button>
                    </div>
                </header>
                <Tabs defaultValue="ordenes">
                    <TabsList variant={"line"}>
                        <TabsTrigger value="ordenes">Ordenes Trabajo</TabsTrigger>
                        <TabsTrigger value="equipos">Equipos</TabsTrigger>
                    </TabsList>
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                            <Download className="mr-2 h-4 w-4" />
                            Excel
                        </Button>
                    </div>
                    <TabsContent value="ordenes">
                        <ServiciosTable data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
                    </TabsContent>
                    <TabsContent value="equipos">
                        <ServiciosTableEquipos data={filteredDataEquipos} onEdit={handleEdit} onDelete={handleDelete} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}