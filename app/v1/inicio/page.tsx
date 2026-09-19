"use client"
import { getDataDashboard } from "@/app/services/dashboard.service";
import { getEquipos } from "@/app/services/ot-equipos.service";
import { ServiciosTable } from "@/components/servicios-table/servicios-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Servicio } from "@/lib/data";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChartBarLabel } from "./chart-bar-label";
import { ChartLineLabel } from "./chart-line-label";
import { ChartPieDonutText } from "./chart-pie-donut-text";
import { SectionCards } from "./section-cards";


export default function pageInicio() {
    // getDataDashboard
    const router = useRouter();

    const [dataDashboard, setDataDashboard] = useState<dataDashboard>({} as dataDashboard);

    useEffect(() => {
        // Definimos la función asíncrona dentro del efecto
        const fetchData = async () => {
            try {
                const data = await getDataDashboard();
                setDataDashboard(data);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchData();
    }, []);

    const [dataEquipos, setDataEquipos] = useState([])
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchData = async () => {
        try {
            const equipos = await getEquipos();
            setDataEquipos(equipos);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    function handleEdit(servicio: Servicio) {
        // Reemplazar por la lógica real de edición.
        router.push(`/v1/ot_equipos/${servicio.n_ot}`);
        // window.alert(`Editar: ${servicio.empresa} (${servicio.numeroOrden})`)
    }

    async function handleDelete(servicio: Servicio) {
        const response = await axios.delete(`${API_URL}/api/v1/ot-equipos/${servicio.id}`);
        toast.success("Orden eliminada con éxito")
        setDataEquipos((prev) => prev.filter((s) => s.id !== servicio.id))
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6 flex justify-between">
                        <p className="text-xl font-medium">Dashboard de Equipos</p>
                        <div className="flex gap-1">
                            <Input type="date" className="w-min" />
                            <span>-</span>
                            <Input type="date" className="w-min" />
                        </div>
                    </div>
                    <SectionCards data={dataDashboard} />
                    <div className="px-4 lg:px-6 grid grid-cols-3 gap-3">
                        <ChartPieDonutText data={dataDashboard}></ChartPieDonutText>
                        {
                            dataDashboard.ot_equipos_x_fecha &&
                            <ChartLineLabel data={dataDashboard}></ChartLineLabel>

                        }
                        {
                            dataDashboard.ot_equipos_x_cliente &&
                            <ChartBarLabel data={dataDashboard}></ChartBarLabel>
                        }
                    </div>
                    <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-3">

                        <Card className="px-3 md:col-span-2">
                            <p className="text-md font-medium">Próximas órdenes de trabajo</p>
                            <ServiciosTable data={dataEquipos} onEdit={handleEdit} onDelete={handleDelete} />
                        </Card>

                        {/* <ChartPieDonutText></ChartPieDonutText> */}

                    </div>
                    {/* <DataTable data={data} /> */}
                </div>
            </div>
        </div>
    )
}
