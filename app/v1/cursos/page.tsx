"use client"
import { GenericTableV2 } from "@/components/generic-table-v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Curso {
    id?: number;
    nombre_curso: string;
    src_portada?: string;
    titulo?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_final?: string;
    deleted?: boolean;
}

export default function PageCursos() {
    const [data, setData] = useState<Curso[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Curso>({
        nombre_curso: "",
        src_portada: "",
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_final: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchCursos();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/cursos`);
            const datosOrdenados = response.data
                .filter((item: any) => !item.deleted)
                .sort((a: any, b: any) => b.id - a.id);
            setData(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener los cursos:", error);
            toast.error("Error al cargar los cursos");
        }
    };

    const filteredData = data.filter((item) =>
        (item.nombre_curso || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Crear nuevo curso
    const handleRegisterClick = () => {
        setFormData({
            nombre_curso: "",
            src_portada: "",
            titulo: "",
            descripcion: "",
            fecha_inicio: "",
            fecha_final: "",
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    // Editar curso
    const handleEdit = (curso: Curso) => {
        setFormData({
            id: curso.id,
            nombre_curso: curso.nombre_curso || "",
            src_portada: curso.src_portada || "",
            titulo: curso.titulo || "",
            descripcion: curso.descripcion || "",
            fecha_inicio: curso.fecha_inicio || "",
            fecha_final: curso.fecha_final || "",
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
        if (!formData.nombre_curso) {
            toast.error("El nombre del curso es obligatorio");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && formData.id) {
                await axios.put(`${API_URL}/api/v1/cursos/${formData.id}`, formData);
                toast.success("Curso actualizado con éxito");
            } else {
                await axios.post(`${API_URL}/api/v1/cursos`, formData);
                toast.success("Curso registrado con éxito");
            }

            setIsOpen(false);
            setIsEditing(false);
            fetchCursos();
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Error al guardar el curso");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (curso: Curso) => {
        
        if (!confirm(`¿Eliminar el curso "${curso.nombre_curso}"?`)) return;

        try {
            await axios.delete(`${API_URL}/api/v1/cursos/${curso.id}`);
            toast.success("Curso eliminado");
            setData(prev => prev.filter(c => c.id !== curso.id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar el curso");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/cursos/report/all`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cursos.xlsx');
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
        { key: "nombre_curso", header: "Nombre del Curso" },
        { key: "titulo", header: "Título" },
        { key: "fecha_inicio", header: "Fecha Inicio" },
        { key: "fecha_final", header: "Fecha Final" },
        { key: "src_portada", header: "Portada" },
    ];

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 m-8">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">Cursos</h1>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleRegisterClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            Registrar Curso
                        </Button>
                    </div>
                </header>

                <div className="flex gap-6">
                    {/* Tabla */}
                    <div className={`flex-1 transition-all ${isOpen ? 'lg:w-2/3' : ''}`}>
                        <div className="flex justify-between mb-3">
                            <Input
                                placeholder="Buscar por nombre, título o descripción..."
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
                                        {isEditing ? "Editar Curso" : "Registrar Nuevo Curso"}
                                    </CardTitle>
                                    <CardDescription>
                                        {isEditing
                                            ? "Modifica los datos del curso"
                                            : "Ingresa los datos del nuevo curso"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre_curso">Nombre del Curso *</Label>
                                            <Input
                                                id="nombre_curso"
                                                placeholder="Curso de Seguridad Industrial"
                                                value={formData.nombre_curso}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nombre_curso: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="titulo">Título</Label>
                                            <Input
                                                id="titulo"
                                                placeholder="Título visible del curso"
                                                value={formData.titulo}
                                                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion">Descripción</Label>
                                            <Textarea
                                                id="descripcion"
                                                placeholder="Descripción detallada del curso..."
                                                value={formData.descripcion}
                                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                                rows={4}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                                                <Input
                                                    id="fecha_inicio"
                                                    type="date"
                                                    value={formData.fecha_inicio}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fecha_final">Fecha Final</Label>
                                                <Input
                                                    id="fecha_final"
                                                    type="date"
                                                    value={formData.fecha_final}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_final: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="src_portada">URL de Portada</Label>
                                            <Input
                                                id="src_portada"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                value={formData.src_portada}
                                                onChange={(e) => setFormData(prev => ({ ...prev, src_portada: e.target.value }))}
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
                                                        ? "Actualizar Curso"
                                                        : "Guardar Curso"
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