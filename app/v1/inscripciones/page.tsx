"use client"
import { GenericTableV2 } from "@/components/generic-table-v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Inscripcion {
    id?: string; // UUID
    dni: string;
    nombres: string;
    apellidos: string;
    curso: string;
    empresa?: string;
    telefono?: string;
    fecha_programada: string;
    fecha_registro?: string;
    deleted?: boolean;
}

export default function PageInscripciones() {
    const [data, setData] = useState<Inscripcion[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Inscripcion>({
        dni: "",
        nombres: "",
        apellidos: "",
        curso: "",
        empresa: "",
        telefono: "",
        fecha_programada: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchInscripciones();
    }, []);

    const fetchInscripciones = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/inscripciones`);
            const datosOrdenados = response.data
                .filter((item: any) => !item.deleted)
                .sort((a: any, b: any) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());
            setData(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener las inscripciones:", error);
            toast.error("Error al cargar las inscripciones");
        }
    };

    const filteredData = data.filter((item) =>
        (item.dni || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.apellidos || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.curso || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.empresa || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Crear nueva inscripción
    const handleRegisterClick = () => {
        setFormData({
            dni: "",
            nombres: "",
            apellidos: "",
            curso: "",
            empresa: "",
            telefono: "",
            fecha_programada: "",
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    // Editar inscripción
    const handleEdit = (inscripcion: Inscripcion) => {
        setFormData({
            id: inscripcion.id,
            dni: inscripcion.dni || "",
            nombres: inscripcion.nombres || "",
            apellidos: inscripcion.apellidos || "",
            curso: inscripcion.curso || "",
            empresa: inscripcion.empresa || "",
            telefono: inscripcion.telefono || "",
            fecha_programada: inscripcion.fecha_programada || "",
        });
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.dni || !formData.nombres || !formData.apellidos || !formData.curso) {
            toast.error("DNI, Nombres, Apellidos y Curso son obligatorios");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && formData.id) {
                await axios.put(`${API_URL}/api/v1/inscripciones/${formData.id}`, formData);
                toast.success("Inscripción actualizada con éxito");
            } else {
                await axios.post(`${API_URL}/api/v1/inscripciones`, formData);
                toast.success("Inscripción registrada con éxito");
            }

            setIsOpen(false);
            setIsEditing(false);
            fetchInscripciones();
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Error al guardar la inscripción");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (inscripcion: Inscripcion) => {
        if (!confirm(`¿Eliminar la inscripción de ${inscripcion.nombres} ${inscripcion.apellidos}?`)) return;

        try {
            await axios.delete(`${API_URL}/api/v1/inscripciones/${inscripcion.id}`);
            toast.success("Inscripción eliminada");
            setData(prev => prev.filter(i => i.id !== inscripcion.id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar la inscripción");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/inscripciones/report/all`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'inscripciones.xlsx');
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
        { key: "dni", header: "DNI" },
        { key: "nombres", header: "Nombres" },
        { key: "apellidos", header: "Apellidos" },
        { key: "curso", header: "Curso" },
        { key: "empresa", header: "Empresa" },
        { key: "telefono", header: "Teléfono" },
        { key: "fecha_programada", header: "Fecha Programada" },
    ];

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 m-8">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">Inscripciones</h1>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleRegisterClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Inscripción
                        </Button>
                    </div>
                </header>

                <div className="flex gap-6">
                    {/* Tabla */}
                    <div className={`flex-1 transition-all ${isOpen ? 'lg:w-2/3' : ''}`}>
                        <div className="flex justify-between mb-3">
                            <Input
                                placeholder="Buscar por DNI, nombres, apellidos o curso..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-96"
                            />
                            <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                                <Download className="mr-2 h-4 w-4" />
                                Excel
                            </Button>
                        </div>

                        <GenericTableV2
                            data={filteredData}
                            columns={columns}
                            idKey="id"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>

                    {/* Card Crear / Editar */}
                    {isOpen && (
                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {isEditing ? "Editar Inscripción" : "Nueva Inscripción"}
                                    </CardTitle>
                                    <CardDescription>
                                        {isEditing
                                            ? "Modifica los datos de la inscripción"
                                            : "Ingresa los datos del participante"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="dni">DNI *</Label>
                                                <Input
                                                    id="dni"
                                                    placeholder="12345678"
                                                    value={formData.dni}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="telefono">Teléfono</Label>
                                                <Input
                                                    id="telefono"
                                                    placeholder="987654321"
                                                    value={formData.telefono}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                                                    maxLength={20}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nombres">Nombres *</Label>
                                            <Input
                                                id="nombres"
                                                placeholder="Juan Carlos"
                                                value={formData.nombres}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="apellidos">Apellidos *</Label>
                                            <Input
                                                id="apellidos"
                                                placeholder="Pérez Gómez"
                                                value={formData.apellidos}
                                                onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="curso">Curso *</Label>
                                            <Input
                                                id="curso"
                                                placeholder="Nombre del curso"
                                                value={formData.curso}
                                                onChange={(e) => setFormData(prev => ({ ...prev, curso: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="empresa">Empresa</Label>
                                            <Input
                                                id="empresa"
                                                placeholder="Nombre de la empresa"
                                                value={formData.empresa}
                                                onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fecha_programada">Fecha Programada *</Label>
                                            <Input
                                                id="fecha_programada"
                                                type="date"
                                                value={formData.fecha_programada}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1"
                                            >
                                                {isSubmitting
                                                    ? "Guardando..."
                                                    : isEditing
                                                        ? "Actualizar Inscripción"
                                                        : "Guardar Inscripción"
                                                }
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={isSubmitting}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}