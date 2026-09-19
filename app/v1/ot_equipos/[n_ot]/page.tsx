"use client";

import { getEquiposByOT } from "@/app/services/ot-equipos.service";
import { FileDownloadButton } from "@/components/file-download-button";
import { GenericTable } from "@/components/generic-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AddEquipoModal } from "./AddEquipoModal";
import { formSchema, FormValues } from "./schema";


// Definimos el tipo para los datos del formulario
interface FormDataOTEquipo {
    empresa: string;
    ruc: string;
    estado: string;
    fechaServicio: string;
    certificadora: string;
    registered: boolean;
}


type Equipo = {
    id: number
    tipo_unidad: string
    placa: string
    ubicacion: string
    tipo_servicio: string
    fecha_servicio: string
    inspector: string
    descripcion: string
    informe_campo_url?: string // Agregado
    informe_final_url?: string
    certificado_url?: string   // Agregado
}
export default function PageOT({ params }: { params: Promise<{ n_ot: string }> }) {
    // En Client Components, los params pueden ser accedidos de forma asíncrona
    const [equipos, setEquipos] = React.useState<Equipo[]>([]);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [idEditEquipo, setidEditEquipo] = useState<null | number>(null)

    const [reqButton, setreqButton] = useState<boolean>(false)
    const [empresas, setEmpresas] = useState([])

    const [n_ot, setNot] = React.useState<string>("");

    React.useEffect(() => {
        params.then((p) => setNot(p.n_ot));
    }, [params]);

    // /api/v1/empresas/
    const getEmpresas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/empresas`);
            setEmpresas(response.data);
        } catch (error: any) {
            console.error('Error al cargar equipos:', error);
            toast.error('Error al cargar los equipos');
        }
    };

    const getEquipos = async () => {
        try {
            const data = await getEquiposByOT(n_ot)
            setEquipos(data);
        } catch (error: any) {
            console.error('Error al cargar equipos:', error);
            toast.error('Error al cargar los equipos');
        }
    };

    const { register, handleSubmit, formState: { errors, isValid }, reset, setValue } = useForm<FormDataOTEquipo>({ mode: "onChange" });


    const [registered, setregistered] = useState<boolean>(false)

    const onSubmit = (data: FormDataOTEquipo) => {
        setreqButton(true)
        console.log("Datos del formulario:", data);
        onSubmitOTEquipo(data)
    };

    const columns = [
        { key: "tipo_unidad", header: "Tipo Unidad" },
        { key: "placa", header: "Placa" },
        { key: "ubicacion", header: "Ubicación" },
        { key: "tipo_servicio", header: "Servicio" },
        { key: "fecha_servicio", header: "Fecha" },
        { key: "inspector", header: "Inspector" },
        {
            key: "informe_campo_url",
            header: "Informe Campo",
            // Aquí usamos el componente FileDownloadButton
            render: (url) => (
                <FileDownloadButton
                    url={url}
                    label="PDF"
                />
            ),
        },
        {
            key: "informe_final_url",
            header: "Informe Final",
            // Aquí usamos el componente FileDownloadButton
            render: (url) => (
                <FileDownloadButton
                    url={url}
                    label="PDF"
                />
            ),
        },
        {
            key: "certificado_url",
            header: "Certificado",
            // Aquí usamos el componente FileDownloadButton
            render: (url) => (
                <FileDownloadButton
                    url={url}
                    label="PDF"
                />
            ),
        },
    ]

    const servicios: Equipo[] = []

    const onSubmitOTEquipo = async (data: FormDataOTEquipo) => {
        try {
            // 1. Axios devuelve los datos directamente en response.data
            // No necesitas llamar a .json(), eso es solo para fetch()
            data["registered"] = true
            const response = await axios.put(`${API_URL}/api/v1/ot-equipos/${n_ot}`, data);

            // 2. Axios lanza una excepción automáticamente si el status no es 2xx
            // Por lo tanto, no necesitas comprobar if (response.status != 200) manualmente
            toast.success(response.data.message || "Actualizado con éxito");
            console.log('Envío exitoso:', response.data);
            setreqButton(false)
            setregistered(true)

        } catch (error: any) {
            // 3. Captura el error de Axios correctamente
            const errorMessage = error.response?.data?.detail || error.message || 'Error al enviar los datos';
            console.error('Error:', errorMessage);
            toast.error(errorMessage);
            setreqButton(false)
        }
    };

    const getOTEquipo = async () => {
        try {
            // 1. Axios devuelve los datos directamente en response.data
            // No necesitas llamar a .json(), eso es solo para fetch()
            const response = await axios.get(`${API_URL}/api/v1/ot-equipos/${n_ot}`);
            // 2. Axios lanza una excepción automáticamente si el status no es 2xx
            // Por lo tanto, no necesitas comprobar if (response.status != 200) manualmente
            setreqButton(false)
            console.log(response.data);
            const data = response.data as FormDataOTEquipo

            // Carga todos los valores de una vez
            reset({
                empresa: data.empresa,
                fechaServicio: data.fechaServicio,
                ruc: data.ruc,
                estado: data.estado || "abierta", // Puedes definir valores por defecto
                certificadora: data.certificadora || "OVERHAUL"
            });
            setregistered(data.registered)

        } catch (error: any) {
            // 3. Captura el error de Axios correctamente
            const errorMessage = error.response?.data?.detail || error.message || 'Error al cargar los datos';
            console.error('Error:', errorMessage);
            toast.error(errorMessage);
            setreqButton(false)
        }
    };

    useEffect(() => {
        getEmpresas()
        if (n_ot) {
            getOTEquipo()
            getEquipos()
        }
    }, [n_ot])

    const onSubmitEquipo = async (formData: FormData, nuevoEquipo) => {
        try {
            // Correcto: pasa el FormData directamente como segundo argumento
            let response_eq
            if (updatedEquipo) {
                response_eq = await axios.patch(
                    `${API_URL}/api/v1/ot-equipos/${n_ot}/equipo/${idEditEquipo}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                const dataAsObject = Object.fromEntries(formData.entries());

                // Cuando actualizas el estado, usas el objeto plano
                setEquipos((prev) =>
                    prev.map((eq) =>
                        eq.id === idEditEquipo ? { ...eq, ...dataAsObject } : eq
                    )
                );
            } else {
                response_eq = await axios.post(
                    `${API_URL}/api/v1/ot-equipos/${n_ot}/equipo`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                nuevoEquipo["id"] = response_eq.data.id
                setEquipos((prev) => [...prev, nuevoEquipo]);
            }


            toast.success(response_eq.data.message || "Equipo agregado con éxito");

        } catch (error: any) {
            const message = error.response_eq?.data?.detail || "Error al enviar el equipo";
            console.error('Error:', error);
            toast.error("Error");
        }
    };

    const saveEquipo = (formData: Equipo) => {
        // 1. Extraemos los datos para el estado local usando .get()
        const nuevoEquipo = {
            id: Date.now(),
            tipo_unidad: formData.get('tipo_unidad') as string,
            placa: formData.get('placa') as string,
            ubicacion: formData.get('ubicacion') as string,
            tipo_servicio: formData.get('tipo_servicio') as string,
            fecha_servicio: formData.get('fecha_servicio') as string,
            inspector: formData.get('inspector') as string,
            descripcion: formData.get('descripcion') as string,
            certificado_url: formData.get("certificado_url") as string,
            informe_final_url: formData.get("informe_final_url") as string
        };

        // 2. Enviamos el FormData original (con archivos incluidos)
        onSubmitEquipo(formData, nuevoEquipo);
        // 3. Actualizamos el estado con los valores extraídos
    };

    const [openModalEquipo, setOpenModalEquipo] = useState(false)
    const [updatedEquipo, setupdatedEquipo] = useState(false)

    function EditEquipo(id: number) {
        // 1. Buscamos el objeto específico, no el array de booleanos
        setidEditEquipo(id)
        const equipoSelected = equipos.find((equipo) => equipo.id === id);
        setupdatedEquipo(true)

        if (equipoSelected) {
            // 2. Cargamos los datos en el formulario usando reset
            // Asegúrate de que los campos coincidan exactamente con tu formulario
            resetEquipos({
                "tipo_unidad": equipoSelected.tipo_unidad,
                "placa": equipoSelected.placa,
                "ubicacion": equipoSelected.ubicacion,
                "tipo_servicio": equipoSelected.tipo_servicio,
                "fecha_servicio": equipoSelected.fecha_servicio,
                "inspector": equipoSelected.inspector,
                "descripcion": equipoSelected.descripcion,
                "informeCampo": null,
                "informeFinal": null,
                "certificado": null,
            });

            // 3. Abrimos el modal solo si encontramos el equipo
            setOpenModalEquipo(true);
        } else {
            console.error("Equipo no encontrado");
        }
    }

    const methodsEquipos = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo_unidad: "",
            placa: "",
            ubicacion: "",
            tipo_servicio: "",
            fecha_servicio: "",
            inspector: "",
            descripcion: "",
            informeCampo: null,
            informeFinal: null,
            certificado: null,
        },
    })

    const { reset: resetEquipos } = methodsEquipos


    async function deleteEquipo(id: number) {
        try {
            const response = await axios.delete(`${API_URL}/api/v1/ot-equipos/${n_ot}/equipo/${id}`);

            // Actualizamos el estado eliminando el equipo con ese ID
            setEquipos((prev) => prev.filter((eq) => eq.id !== id));

            console.log("Equipo eliminado con éxito");
            toast.success(response.data.message)
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
    return (
        <div className="m-10 mx-12 mt-16">
            <h1 className="text-2xl font-medium mb-4">Orden: {n_ot}</h1>
            <AlertDialog open={idToDelete !== null} onOpenChange={() => setIdToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el equipo seleccionado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => idToDelete && deleteEquipo(idToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Card contenedor */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white w-full">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
                    {/* Fila de 2 campos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Empresa</label>
                            <select
                                {...register("empresa", {
                                    required: true,
                                    onChange: (e) => {
                                        // Buscamos el objeto de la empresa seleccionada por su razon_social
                                        const empresaSeleccionada = empresas.find(
                                            (emp) => emp.razon_social === e.target.value
                                        );

                                        if (empresaSeleccionada) {
                                            setValue("ruc", empresaSeleccionada.ruc)
                                        }
                                    }
                                })} className={SELECT_CLASSES}>
                                <option value="">Seleccione una empresa</option>
                                {
                                    empresas.length > 0 && empresas.map((empresa, i) => (
                                        <option value={empresa["razon_social"]} key={i} >{empresa["razon_social"]}s</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RUC</label>
                            <input
                                className={INPUT_CLASSES}
                                type="number"
                                {...register("ruc", {
                                    required: "El RUC es obligatorio",
                                    pattern: {
                                        value: /^\d{11}$/,
                                        message: "El RUC debe tener exactamente 11 dígitos"
                                    },
                                    onChange: (e) => {
                                        // 1. Limpiamos: removemos todo lo que no sea número
                                        let value = e.target.value.replace(/[^0-9]/g, '');

                                        // 2. Cortamos: si tiene más de 11, lo truncamos
                                        if (value.length > 11) {
                                            value = value.slice(0, 11);
                                            setValue("ruc", value)
                                        }

                                        // 3. Aplicamos el valor limpio de vuelta al input
                                        e.target.value = value;
                                    }
                                })}
                                placeholder="Ej: 12345678901"
                            />
                            {errors.ruc && (
                                <span className="text-red-500 text-sm">{errors.ruc.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Fila de 3 campos */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select {...register("estado", { required: true })} defaultValue={"abierta"} className={SELECT_CLASSES}>
                                <option value="pendiente">Pendiente</option>
                                <option value="abierta">Abierta</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="cerrada">Cerrada</option>
                                <option value="anulada">Anulada</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha servicio</label>
                            <input className={INPUT_CLASSES} type="date" {...register("fechaServicio", { required: true })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Certificadora</label>
                            <select {...register("certificadora")} defaultValue="OVERHAUL" className={SELECT_CLASSES}>
                                <option value="OVERHAUL">OVERHAUL</option>
                                <option value="PREXA">PREXA</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Button type="submit" disabled={reqButton} className="py-1 px-4 me-4 text-sm bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition mt-4">
                            Guardar
                        </Button>

                        {/* <Button type="button" className="px-4 py-1 text-sm bg-gray-500 text-white font-semibold rounded hover:bg-gray-600 transition mt-4">
                            Cancelar
                        </Button> */}
                    </div>

                </form>
            </div>
            <div className="flex gap-3 mt-8 mb-3">
                <h3 className="text-lg font-medium">Equipos</h3>
                {registered && (
                    <AddEquipoModal
                        onSave={saveEquipo}
                        open={openModalEquipo}
                        setOpen={setOpenModalEquipo}
                        methods={methodsEquipos}
                        updatedEquipo={updatedEquipo}
                        setupdatedEquipo={setupdatedEquipo}
                    />
                )}

            </div>
            <GenericTable

                data={equipos}
                columns={columns}
                idKey="id"

                onEdit={(id) => {
                    EditEquipo(id as number)
                }}

                onDelete={(id) => {
                    deleteEquipo(id as number)
                    setEquipos(equipos.filter((e) => e.id !== id));
                }}

            />
        </div>
    );
}

const SELECT_CLASSES = "w-full border border-gray-300 rounded p-2 h-9 mt-1 text-sm";
const INPUT_CLASSES = "w-full border border-gray-300 rounded p-2 h-9 mt-1  text-sm"

