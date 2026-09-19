interface OtEquipo {
    empresa: string;
    ruc: string;
    n_ot: string;
}

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