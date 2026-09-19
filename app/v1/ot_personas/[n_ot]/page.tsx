"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormDataOTPersona {
    empresa: string;
    ruc: string;
    modalidad: string;
    cursos: string;
    nombres: string;
    apellidos: string;
    dni: string;
    fecha: string;
    aprobo: boolean;
    certificadora: string;
    proyecto: string;
    instructor: string;
    archivo_foto_pdf: any;
    certificado: string;
    comentarios: string;
    n_veces: number;
}

export default function PageOT({ params }: { params: Promise<{ n_ot: string }> }) {
    const [n_ot, setNot] = React.useState<string>("");
    const [reqButton, setreqButton] = useState<boolean>(false);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    React.useEffect(() => {
        params.then((p) => setNot(p.n_ot));
    }, [params]);

    const getEmpresas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/empresas`);
            setEmpresas(response.data);
        } catch (error: any) {
            toast.error('Error al cargar empresas');
        }
    };

    const { 
        register, 
        handleSubmit, 
        reset, 
        setValue, 
        formState: { errors } 
    } = useForm<FormDataOTPersona>({
        mode: "onChange",
        defaultValues: {
            certificadora: "OVERHAUL",
            n_veces: 1,
            modalidad: "Presencial",
            aprobo: false,
        }
    });

    const onSubmit = async (data: FormDataOTPersona) => {
        setreqButton(true);
        try {
            const response = await axios.put(`${API_URL}/api/v1/ot-personas/${n_ot}`, data);
            toast.success(response.data.message || "Actualizado con éxito");
        } catch (error: any) {
            toast.error('Error al guardar');
        } finally {
            setreqButton(false);
        }
    };

    const getOTPersona = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/ot-personas/${n_ot}`);
            reset(response.data);
        } catch (error: any) {
            toast.error('Error al cargar datos');
        }
    };

    useEffect(() => {
        getEmpresas();
        if (n_ot) getOTPersona();
    }, [n_ot]);

    return (
        <div className="m-10 mx-12 mt-16">
            <h1 className="text-2xl font-medium mb-4">Orden Persona: {n_ot}</h1>
            <div className="border border-gray-200 rounded-lg p-6 bg-white w-full">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
                    <Tabs defaultValue="empresa">
                        <TabsList variant={"line"}>
                            <TabsTrigger value="empresa">Empresa / Proyecto</TabsTrigger>
                            <TabsTrigger value="datos_personales">Datos Personal</TabsTrigger>
                            <TabsTrigger value="curso">Curso / Detalles</TabsTrigger>
                        </TabsList>

                        <TabsContent value="empresa" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Empresa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register("empresa", { required: "La empresa es obligatoria" })}
                                        className={SELECT_CLASSES}
                                        onChange={(e) => {
                                            const empresaSeleccionada = empresas.find(
                                                (emp) => emp.razon_social === e.target.value
                                            );
                                            if (empresaSeleccionada) {
                                                setValue("ruc", empresaSeleccionada.ruc, { shouldValidate: true });
                                            }
                                        }}
                                    >
                                        <option value="">Seleccione una empresa</option>
                                        {empresas.map((empresa, i) => (
                                            <option value={empresa["razon_social"]} key={i}>
                                                {empresa["razon_social"]}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.empresa && (
                                        <span className="text-red-500 text-sm">{errors.empresa.message}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        RUC <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className={INPUT_CLASSES}
                                        type="text"
                                        {...register("ruc", {
                                            required: "El RUC es obligatorio",
                                            pattern: {
                                                value: /^\d{11}$/,
                                                message: "El RUC debe tener exactamente 11 dígitos"
                                            }
                                        })}
                                        placeholder="Ej: 12345678901"
                                        maxLength={11}
                                    />
                                    {errors.ruc && (
                                        <span className="text-red-500 text-sm">{errors.ruc.message}</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Proyecto</label>
                                <input {...register("proyecto", { required: "El proyecto es obligatorio" })} className={INPUT_CLASSES} />
                                    {errors.proyecto && <span className="text-red-500 text-sm">{errors.proyecto.message}</span>}
                                    
                            </div>
                        </TabsContent>

                        <TabsContent value="datos_personales" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombres <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("nombres", { required: "Los nombres son obligatorios" })}
                                        className={INPUT_CLASSES}
                                    />
                                    {errors.nombres && <span className="text-red-500 text-sm">{errors.nombres.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Apellidos <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("apellidos", { required: "Los apellidos son obligatorios" })}
                                        className={INPUT_CLASSES}
                                    />
                                    {errors.apellidos && <span className="text-red-500 text-sm">{errors.apellidos.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    DNI <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("dni", {
                                        required: "El DNI es obligatorio",
                                        pattern: {
                                            value: /^\d{8}$/,
                                            message: "El DNI debe tener 8 dígitos"
                                        }
                                    })}
                                    className={INPUT_CLASSES}
                                    type="text"
                                    maxLength={8}
                                />
                                {errors.dni && <span className="text-red-500 text-sm">{errors.dni.message}</span>}
                            </div>
                        </TabsContent>

                        <TabsContent value="curso" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Modalidad <span className="text-red-500">*</span>
                                    </label>
                                    <select {...register("modalidad", { required: true })} className={SELECT_CLASSES}>
                                        <option value="Presencial">Presencial</option>
                                        <option value="Virtual">Virtual</option>
                                        <option value="Semi-presencial">Semi-presencial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Curso <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("cursos", { required: "El curso es obligatorio" })}
                                        className={INPUT_CLASSES}
                                    />
                                    {errors.cursos && <span className="text-red-500 text-sm">{errors.cursos.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Instructor <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("instructor", { required: "El instructor es obligatorio" })}
                                        className={INPUT_CLASSES}
                                    />
                                    {errors.instructor && <span className="text-red-500 text-sm">{errors.instructor.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Certificadora</label>
                                    <select {...register("certificadora")} className={SELECT_CLASSES}>
                                        <option value="OVERHAUL">OVERHAUL</option>
                                        <option value="PREXA">PREXA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fecha <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("fecha", { required: "La fecha es obligatoria" })}
                                        className={INPUT_CLASSES}
                                        type="date"
                                    />
                                    {errors.fecha && <span className="text-red-500 text-sm">{errors.fecha.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">N° Veces</label>
                                    <select {...register("n_veces")} className={SELECT_CLASSES}>
                                        {[1, 2, 3].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input {...register("aprobo")} type="checkbox" className="h-4 w-4" />
                                <label className="text-sm font-medium text-gray-700">¿Aprobó?</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comentarios</label>
                                <textarea {...register("comentarios")} className={INPUT_CLASSES} rows={3} />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button type="submit" disabled={reqButton} className="bg-blue-600 text-white mt-4">
                        {reqButton ? "Guardando..." : "Guardar"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

const SELECT_CLASSES = "w-full border border-gray-300 rounded p-2 h-9 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const INPUT_CLASSES = "w-full border border-gray-300 rounded p-2 h-9 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";