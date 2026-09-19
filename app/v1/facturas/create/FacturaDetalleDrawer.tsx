'use client';

import { getEquiposByOT } from '@/app/services/ot-equipos.service';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

interface FacturaDetalleDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    detalle?: FacturaDetalle | null;
    onSave: (detalle: FacturaDetalle) => void;
    isEditing?: boolean;
    n_ot?: string | number | null;
}

export default function FacturaDetalleDrawer({
    open,
    onOpenChange,
    detalle,
    onSave,
    isEditing = false,
    n_ot,
}: FacturaDetalleDrawerProps) {

    const [equipos, setEquipos] = useState<any[]>([]);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FacturaDetalle>({
        defaultValues: {
            descripcion: '',
            cantidad: 1,
            precio_unitario: 0,
            subtotal: 0,
            igv: 0,
            total: 0,
            unidad: 'UN',
            id_equipo: undefined,
        }
    });

    const cantidad = watch('cantidad');
    const precio_unitario = watch('precio_unitario');

    // Cargar datos al editar
    useEffect(() => {
        if (detalle) {
            reset(detalle);
        } else {
            reset({
                descripcion: '',
                cantidad: 1,
                precio_unitario: 0,
                subtotal: 0,
                igv: 0,
                total: 0,
                unidad: 'UN',
                id_equipo: undefined,
            });
        }
    }, [detalle, reset]);

    // Calcular totales automáticamente
    useEffect(() => {
        if (cantidad && precio_unitario) {
            const subtotal = Number((cantidad * precio_unitario).toFixed(2));
            const igv = Number((subtotal * 0.18).toFixed(2));
            const total = Number((subtotal + igv).toFixed(2));

            setValue('subtotal', subtotal);
            setValue('igv', igv);
            setValue('total', total);
        }
    }, [cantidad, precio_unitario, setValue]);

    // Cargar equipos
    const getEquipos = async () => {
        if (!n_ot) return;
        try {
            const data = await getEquiposByOT(n_ot as string);
            setEquipos(data || []);
        } catch (error) {
            console.error('Error al cargar equipos:', error);
            toast.error('Error al cargar los equipos');
        }
    };

    useEffect(() => {
        if (n_ot) getEquipos();
    }, [n_ot]);

    const onSubmit = (data: FacturaDetalle) => {
        if (!data.descripcion?.trim()) {
            toast.error("La descripción es obligatoria");
            return;
        }
        onSave(data);
        onOpenChange(false);
    };
    const idEquipoRegister = register("id_equipo");
    
    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="left" shouldScaleBackground={false}>
            <DrawerOverlay className="bg-black/0" />

            <DrawerContent className="h-full w-full max-w-md sm:max-w-lg border-r shadow-xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
            >
                <DrawerHeader>
                    <DrawerTitle>
                        {isEditing ? 'Editar Ítem de Factura' : 'Nuevo Ítem de Factura'}
                    </DrawerTitle>
                    <DrawerDescription>
                        Ingresa los datos del detalle. Los totales se calculan automáticamente.
                    </DrawerDescription>
                </DrawerHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 flex-1 overflow-auto pb-8 space-y-6">

                    {/* Equipo */}
                    <div className="space-y-2">
                        <Label htmlFor="id_equipo">Equipo</Label>
                        <select
                            {...idEquipoRegister}
                            onChange={(e) => {
                                idEquipoRegister.onChange(e);

                                const equipo = equipos.find(
                                    (eq) => eq.id === Number(e.target.value)
                                );

                                if (equipo) {
                                    setValue(
                                        "descripcion",
                                        `${equipo.placa} | ${equipo.tipo_unidad} | ${equipo.tipo_servicio}`
                                    );
                                }
                            }}
                        >
                            <option value="">Seleccionar equipo</option>
                            {equipos.map((equipo) => (
                                <option key={equipo.id} value={equipo.id}>
                                    {equipo.placa} | {equipo.tipo_unidad} | {equipo.tipo_servicio}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción *</Label>
                        <Textarea
                            id="descripcion"
                            {...register('descripcion', { required: true })}
                            placeholder="Describe el servicio, producto o concepto..."
                            rows={4}
                        />
                    </div>

                    {/* Unidad y Cantidad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unidad">Unidad</Label>
                            <Select onValueChange={(value) => setValue('unidad', value)} defaultValue={watch('unidad')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UN">UN - Unidad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input
                                id="cantidad"
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register('cantidad', { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    {/* Precio Unitario */}
                    <div className="space-y-2">
                        <Label htmlFor="precio_unitario">Precio Unitario (S/)</Label>
                        <Input
                            id="precio_unitario"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('precio_unitario', { valueAsNumber: true })}
                        />
                    </div>

                    {/* Totales */}
                    <div className="bg-gray-50 border rounded-xl p-6 space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium">S/ {watch('subtotal')?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>IGV (18%)</span>
                            <span className="font-medium">S/ {watch('igv')?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="pt-4 border-t flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>S/ {watch('total')?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                </form>

                <DrawerFooter className="border-t px-6 py-4">
                    <div className="flex gap-3">
                        <DrawerClose asChild>
                            <Button variant="outline" className="flex-1">
                                Cancelar
                            </Button>
                        </DrawerClose>
                        <Button type="button" onClick={handleSubmit(onSubmit)} className="flex-1">
                            {isEditing ? 'Guardar Cambios' : 'Agregar a la Factura'}
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}