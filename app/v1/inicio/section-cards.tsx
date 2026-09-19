"use client"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Building2, CircleCheckBig, ClipboardList, Clock5, RefreshCcw } from "lucide-react"


export function SectionCards({data} :{data :dataDashboard}) {
  return (
    <div className="grid grid-cols-1 gap-3 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>OT Equipos Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.ot_equipos_totales}
          </CardTitle>
          <CardAction>
            <ClipboardList size={38} className="text-gray-800" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pendientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.ot_equipos_pending}
          </CardTitle>
          <CardAction>
            <Clock5 size={38} className="text-gray-800" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>En proceso</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.ot_equipos_procesing}
          </CardTitle>
          <CardAction>
            <RefreshCcw size={38} className="text-gray-800" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Abiertas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.ot_equipos_abierta}
          </CardTitle>
          <CardAction>
            <RefreshCcw size={38} className="text-gray-800" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cerradas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.ot_equipos_cerrada}
          </CardTitle>
          <CardAction>
            <CircleCheckBig size={38} className="text-gray-800" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.ot_equipos_clients_actives}

          </CardTitle>
          <CardAction>
            <Building2 size={40} className="text-gray-800" />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
