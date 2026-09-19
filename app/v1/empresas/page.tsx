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

interface Empresa {
    id?: number;
    ruc: string;
    razon_social: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    deleted?: boolean;
}

export default function PageEmpresas() {
    const [data, setData] = useState<Empresa[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Empresa>({
        ruc: "",
        razon_social: "",
        direccion: "",
        telefono: "",
        email: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/empresas`);
            const datosOrdenados = response.data
                .filter((item: any) => !item.deleted)
                .sort((a: any, b: any) => b.id - a.id);
            setData(datosOrdenados);
        } catch (error) {
            console.error("Error al obtener las empresas:", error);
            toast.error("Error al cargar las empresas");
        }
    };

    const filteredData = data.filter((item) =>
        (item.ruc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.razon_social || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.direccion || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Crear nueva empresa
    const handleRegisterClick = () => {
        setFormData({
            ruc: "",
            razon_social: "",
            direccion: "",
            telefono: "",
            email: "",
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    // Editar empresa
    const handleEdit = (empresa: Empresa) => {
        console.log(empresa);

        setFormData({
            id: empresa.id,
            ruc: empresa.ruc || "",
            razon_social: empresa.razon_social || "",
            direccion: empresa.direccion || "",
            telefono: empresa.telefono || "",
            email: empresa.email || "",
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
        if (!formData.ruc || !formData.razon_social) {
            toast.error("RUC y Razón Social son obligatorios");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && formData.id) {
                await axios.put(`${API_URL}/api/v1/empresas/${formData.id}`, formData);
                toast.success("Empresa actualizada con éxito");
            } else {
                await axios.post(`${API_URL}/api/v1/empresas`, formData);
                toast.success("Empresa registrada con éxito");
            }

            setIsOpen(false);
            setIsEditing(false);
            fetchEmpresas();
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Error al guardar la empresa");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (empresa: Empresa) => {
        if (!confirm(`¿Eliminar empresa ${empresa.razon_social}?`)) return;

        try {
            await axios.delete(`${API_URL}/api/v1/empresas/${empresa.id}`);
            toast.success("Empresa eliminada");
            setData(prev => prev.filter(e => e.id !== empresa.id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar la empresa");
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/empresas/report/all`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'empresas.xlsx');
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
        { key: "ruc", header: "RUC" },
        { key: "razon_social", header: "Razón Social" },
        { key: "direccion", header: "Dirección" },
        { key: "telefono", header: "Teléfono" },
        { key: "email", header: "Email" },
    ];

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 m-8">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">Empresas</h1>
                    <div className="flex items-center gap-2">

                        <Button onClick={handleRegisterClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            Registrar Empresa
                        </Button>
                    </div>
                </header>

                <div className="flex gap-6">
                    {/* Tabla */}
                    <div className={`flex-1 transition-all ${isOpen ? 'lg:w-2/3' : ''}`}>
                        <div className="flex justify-between mb-3">
                            <Input
                                placeholder="Buscar por RUC, Razón Social o Dirección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-80"
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
                            onEdit={handleEdit}        // ← Ahora recibe el objeto completo de la empresa
                            onDelete={handleDelete}
                        />
                    </div>

                    {/* Card Crear / Editar */}
                    {isOpen && (
                        <div className="w-full lg:w-1/3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {isEditing ? "Editar Empresa" : "Registrar Nueva Empresa"}
                                    </CardTitle>
                                    <CardDescription>
                                        {isEditing
                                            ? "Modifica los datos de la empresa"
                                            : "Ingresa los datos de la nueva empresa"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ruc">RUC</Label>
                                            <Input
                                                id="ruc"
                                                placeholder="12345678901"
                                                value={formData.ruc}
                                                onChange={(e) => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
                                                maxLength={11}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="razon_social">Razón Social</Label>
                                            <Input
                                                id="razon_social"
                                                placeholder="Empresa S.A.C."
                                                value={formData.razon_social}
                                                onChange={(e) => setFormData(prev => ({ ...prev, razon_social: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="direccion">Dirección</Label>
                                            <Input
                                                id="direccion"
                                                placeholder="Av. Principal 123"
                                                value={formData.direccion}
                                                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="telefono">Teléfono</Label>
                                                <Input
                                                    id="telefono"
                                                    placeholder="987654321"
                                                    value={formData.telefono}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="contacto@empresa.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                />
                                            </div>
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
                                                        ? "Actualizar Empresa"
                                                        : "Guardar Empresa"
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