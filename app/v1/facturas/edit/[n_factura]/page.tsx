'use client';

import { api } from '@/app/services/api';
import { getEquipos } from '@/app/services/ot-equipos.service';
import { GenericTableV2 } from '@/components/generic-table-v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import FacturaDetalleDrawer from '../../create/FacturaDetalleDrawer';

interface FacturaHeader {
    id_factura?: bigint;
    n_factura: string;
    fecha_emision: string;
    sin_igv: number;
    igv: number;
    total: number;
    detraccion: number;
    facturo: boolean;
    pagado: boolean;
    pago_detraccion: boolean;
    en_dolares?: string;
    moneda: string;
    tipo_ot?: string;
    id_ot?: bigint;
    razon_social: string;
    ruc: string;
    n_ot?: string;
}

interface FacturaDetalle {
    id_factura_detalle?: bigint;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    igv: number;
    total: number;
    unidad?: string;
    id_equipo?: bigint;
}

interface OtEquipo {
    empresa: string;
    ruc: string;
    n_ot: string;
}

export default function PageFacturaEdit({ params }: { params: Promise<{ n_factura: string }> }) {

    const [n_factura, setn_factura] = useState<string>("");

    const { register, watch, setValue, handleSubmit, reset, getValues } = useForm<FacturaHeader>({
        defaultValues: {
            n_factura: '',
            fecha_emision: new Date().toISOString().split('T')[0],
            sin_igv: 0,
            igv: 0,
            total: 0,
            detraccion: 0,
            facturo: false,
            pagado: false,
            pago_detraccion: false,
            moneda: 'PEN',
            razon_social: '',
            ruc: '',
            tipo_ot: '',
            id_ot: undefined,
            n_ot: '',
        }
    });

    const [detalles, setDetalles] = useState<FacturaDetalle[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [detalleToEdit, setDetalleToEdit] = useState<FacturaDetalle | null>(null);
    const [dataOT, setDataOT] = useState<OtEquipo[]>([]);
    const [n_ot_selected, setn_ot_selected] = useState<string | null>(null);

    const columns = [
        { key: "descripcion", header: "Descripción" },
        { key: "cantidad", header: "Cantidad" },
        { key: "unidad", header: "Unidad" },
        { key: "precio_unitario", header: "Precio Unitario" },
        { key: "subtotal", header: "Subtotal" },
        { key: "igv", header: "IGV" },
        { key: "total", header: "Total" },
    ];

    // Cargar factura existente
    const getFactura = async () => {
        if (!n_factura) return;
        try {
            const { data } = await api.get(`/api/v1/facturas/${n_factura}`);

            reset({
                ...data.factura,
                n_factura: n_factura,
            });

            setDetalles(data.detalles || []);

            if (data.n_ot) {
                setn_ot_selected(data.n_ot);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la factura");
        }
    };

    // Cargar equipos/OT
    const fetchDataEquipos = async () => {
        try {
            const equipos = await getEquipos();
            setDataOT(equipos || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        params.then((p) => setn_factura(p.n_factura));
    }, [params]);

    useEffect(() => {
        if (n_factura) {
            getFactura();
        }
        fetchDataEquipos();
    }, [n_factura]);

    useEffect(() => {
        const ot_selected = dataOT.find(ot => ot.n_ot === n_ot_selected);
        if (ot_selected) {
            setValue("ruc", ot_selected.ruc);
            setValue("razon_social", ot_selected.empresa);
        }
    }, [n_ot_selected, dataOT, setValue]);

    // Calcular totales automáticamente
    useEffect(() => {
        const sinIgv = detalles.reduce((sum, d) => sum + (d.subtotal || 0), 0);
        const igvTotal = detalles.reduce((sum, d) => sum + (d.igv || 0), 0);
        const totalFinal = detalles.reduce((sum, d) => sum + (d.total || 0), 0);

        setValue('sin_igv', sinIgv);
        setValue('igv', igvTotal);
        setValue('total', totalFinal);
    }, [detalles, setValue]);

    // Funciones del Drawer
    const handleAddItem = () => {
        setDetalleToEdit(null);
        setIsDrawerOpen(true);
    };

    const handleEditItem = (item: FacturaDetalle) => {
        setDetalleToEdit(item);
        setIsDrawerOpen(true);
    };

    const handleSaveDetalle = (nuevoDetalle: FacturaDetalle) => {
        if (detalleToEdit?.id_factura_detalle) {
            setDetalles(prev => prev.map(d =>
                d.id_factura_detalle === detalleToEdit.id_factura_detalle ? nuevoDetalle : d
            ));
        } else {
            setDetalles(prev => [...prev, {
                ...nuevoDetalle,
                id_factura_detalle: Date.now() as any
            }]);
        }
    };

    const handleDeleteDetalle = (id: string | number) => {
        setDetalles(prev => prev.filter(d => d.id_factura_detalle !== id));
    };

    // Actualizar factura (PUT)
    const onSubmitFactura = async (data: FacturaHeader) => {
        const facturaCompleta = {

            "sin_igv": data.sin_igv,
            "razon_social": data.razon_social,
            "ruc": data.ruc,
            "n_ot": n_ot_selected || data.n_ot,
            "fecha_emision": data.fecha_emision,
            "moneda": data.moneda,
            "pagado": data.pagado,
            "facturo": data.facturo,
            "pago_detraccion": data.pago_detraccion,
            "total": data.total,

            detalles: detalles,
        };

        try {
            const response = await api.put(`/api/v1/facturas/${n_factura}`, facturaCompleta);

            if (response.status === 200) {
                toast.success('Factura actualizada correctamente');
                window.location.reload()
            } else {
                toast.error('Error al actualizar la factura');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        }
    };

    return (
        <div className="container px-8 py-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmitFactura)}>
                {/* Cabecera */}
                <Card className="overflow-hidden p-0 rounded-md">
                    <CardHeader className="px-8 py-6 border-b">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 rounded-md flex items-center justify-center border">
                                    <span className="text-4xl">{"{}"}</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">OVERHAUL MINING E.I.R.L.</h1>
                                    <p className="text-sm text-gray-800 mt-1 leading-tight">
                                        AV. MANCO CAPAC NRO. 1346<br />
                                        BALBAÑOS DEL INCA LOS BAÑOS DEL INCA<br />
                                        CAJAMARCA - CAJAMARCA
                                    </p>
                                </div>
                            </div>

                            <div className="text-right border rounded-md p-4">
                                <div className="text-xs tracking-widest mb-1">R.U.C. N° 20602129749</div>
                                <div className="text-xl font-bold mb-2">FACTURA ELECTRÓNICA</div>
                                <Input
                                    {...register('n_factura')}
                                    className="bg-white text-black font-mono text-center w-32 font-semibold"
                                    placeholder="F001-00000001"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-7 space-y-5">
                                <div>
                                    <Label className="text-sm font-semibold">Cliente (Razón Social)</Label>
                                    <Input
                                        {...register('razon_social')}
                                        className="mt-1"
                                        placeholder="Nombre / Razón Social del cliente"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>RUC</Label>
                                        <Input
                                            {...register('ruc')}
                                            className="mt-1 font-mono"
                                            placeholder="12345678901"
                                        />
                                    </div>
                                    <div>
                                        <Label>Fecha de Emisión</Label>
                                        <Input
                                            type="date"
                                            {...register('fecha_emision')}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label>Tipo de Orden</Label>
                                        <Select
                                            value={watch('tipo_ot')}
                                            onValueChange={(value) => setValue('tipo_ot', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Equipo">Equipo</SelectItem>
                                                <SelectItem value="Persona">Persona</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>OT</Label>
                                        <div className='flex gap-2'>
                                            <Select
                                                value={watch('n_ot') || ''}
                                                onValueChange={(value) => {
                                                    setValue('n_ot', value);
                                                    setn_ot_selected(value);
                                                }}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Seleccionar OT" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dataOT.map((item: any) => (
                                                        <SelectItem key={item.id} value={item.n_ot}>
                                                            {item.n_ot}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Link
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={"/v1/ot_equipos/" + (n_ot_selected || getValues("n_ot"))}>
                                                <Button className="mt-1" type='button'>ver OT</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-5 space-y-5">
                                <div>
                                    <Label>Moneda</Label>
                                    <Select
                                        value={watch('moneda')}
                                        onValueChange={(value) => setValue('moneda', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PEN">PEN - Soles</SelectItem>
                                            <SelectItem value="USD">USD - Dólares</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                        <Label className="font-medium">Facturado</Label>
                                        <Switch
                                            checked={watch('facturo')}
                                            onCheckedChange={(checked) => setValue('facturo', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                        <Label className="font-medium">Pagado</Label>
                                        <Switch
                                            checked={watch('pagado')}
                                            onCheckedChange={(checked) => setValue('pagado', checked)}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                        <Label className="font-medium">Pago de Detracción</Label>
                                        <Switch
                                            checked={watch('pago_detraccion')}
                                            onCheckedChange={(checked) => setValue('pago_detraccion', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="submit" size="lg">
                                Actualizar Factura
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Detalles */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Detalle de Factura</h2>
                    <Button onClick={handleAddItem}>Agregar Ítem</Button>
                </div>

                <FacturaDetalleDrawer
                    n_ot={getValues("n_ot")}
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    detalle={detalleToEdit}
                    onSave={handleSaveDetalle}
                    isEditing={!!detalleToEdit}
                />

                <GenericTableV2
                    data={detalles}
                    columns={columns}
                    idKey="id_factura_detalle"
                    onEdit={handleEditItem}
                    onDelete={handleDeleteDetalle}
                />
            </div>

            {/* Totales */}
            <Card className="w-fit ml-auto border-gray-300">
                <CardContent className="px-8 py-6">
                    <div className="space-y-4 min-w-[320px]">
                        <div className="flex justify-between text-md">
                            <span>Subtotal (sin IGV)</span>
                            <span className="font-semibold">
                                {watch('moneda')} {watch('sin_igv')?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between text-md">
                            <span>IGV (18%)</span>
                            <span className="font-semibold">
                                {watch('moneda')} {watch('igv')?.toFixed(2) || '0.00'}
                            </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>
                                {watch('moneda')} {watch('total')?.toFixed(2) || '0.00'}
                            </span>
                        </div>

                        {watch('detraccion') > 0 && (
                            <>
                                <Separator />
                                <div className="flex justify-between text-lg">
                                    <span>Detracción</span>
                                    <span className="font-semibold text-orange-600">
                                        - {watch('moneda')} {watch('detraccion')?.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}