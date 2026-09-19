"use client"
import { GenericTable } from "@/components/generic-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Servicio } from "@/lib/data";
import axios from "axios";
import { Download } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PagePersonas() {

    const router = useRouter();
    const [data, setData] = useState<Servicio[]>([])
    const [searchTerm, setSearchTerm] = useState("");
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/v1/ot-personas`);
                const datosOrdenados = response.data
                    .filter((item: any) => !item.deleted)
                    .sort((a: any, b: any) => b.id - a.id);
                setData(datosOrdenados);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchData();
    }, []);

    const filteredData = data.filter((item) =>
        (item.n_ot || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.empresa || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.certificadora || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    function handleEdit(n_ot:str) {
        console.log(n_ot);
        
        router.push(`/v1/ot_personas/${n_ot}`);
    }

    async function handleDelete(n_ot: str) {
        try {
            await axios.delete(`${API_URL}/api/v1/ot-personas/${n_ot}`);
            toast.success("Orden eliminada con éxito");
            setData((prev) => prev.filter((s) => s.n_ot !== n_ot));
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar la orden");
        }
    }

    const createOt = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/v1/create_ot_persona`);
            const { n_ot } = response.data;

            if (n_ot) {
                router.push(`/v1/ot_personas/${n_ot}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error al crear la OT:", error);
            throw error;
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/ot-personas/report/all`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ot_personas.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Excel descargado con éxito");
        } catch (error) {
            console.error("Error al descargar el excel:", error);
            toast.error("Error al descargar el archivo");
        }
    };

    const columns = [
        { key: "n_ot", header: "N° OT" },
        { key: "empresa", header: "Empresa" },
        { key: "ruc", header: "RUC" },
        { key: "modalidad", header: "Modalidad" },
        { key: "cursos", header: "Curso/Servicio" },
        { key: "nombres", header: "Nombres" },
        { key: "apellidos", header: "Apellidos" },
        { key: "dni", header: "DNI" },
        { key: "fecha", header: "Fecha" },
        { key: "aprobo", header: "Aprobó" },
        { key: "certificadora", header: "Certificadora" },
        { key: "instructor", header: "Instructor" },
        { key: "comentarios", header: "Comentarios" }
    ];

    return (

        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 m-8">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">OT Personas</h1>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Buscar por OT, empresa o certificadora..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        <Button onClick={createOt}>+ Registro</Button>
                    </div>
                </header>
                <Tabs defaultValue="ordenes">
                    <TabsList variant={"line"}>
                        <TabsTrigger value="ordenes">Ordenes Trabajo</TabsTrigger>
                    </TabsList>
                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                            <Download className="mr-2 h-4 w-4" />
                            Excel
                        </Button>
                    </div>
                    <TabsContent value="ordenes">
                        <GenericTable
                            data={filteredData}
                            columns={columns}
                            idKey="n_ot"
                            onEdit={(registro) => handleEdit(registro as Servicio)}
                            onDelete={(registro) => handleDelete(registro as Servicio)}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
