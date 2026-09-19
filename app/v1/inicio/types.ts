
interface EquiposXCliente{
    empresa : string,
    cantidad : number
}

interface EquiposxFecha{
    fecha: string
    cantidad : number
}

interface dataDashboard{
    "ot_equipos_totales": number
    "ot_equipos_pending": number
    "ot_equipos_procesing": number
    "ot_equipos_cerrada": number
    "ot_equipos_abierta": number
    "ot_equipos_clients_actives" : number
    "ot_equipos_x_cliente": EquiposXCliente[] 
    "ot_equipos_x_fecha" : EquiposxFecha[]
}