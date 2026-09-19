"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"

export const description = "A bar chart with a label"

const chartConfig = {
  cantidad: {
    label: "cantidad",
    color: "var(--chart-bar-color-cantidad)",
  },
} satisfies ChartConfig

export function ChartBarLabel({ data }: { data: dataDashboard }) {

  const [chartData, setchartData] = useState<EquiposXCliente[]>([] as EquiposXCliente[])

  useEffect(() => {
    if (data) {
      setchartData(data["ot_equipos_x_cliente"])
    }
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordenes por cliente</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical" // 2. IMPORTANTE: Cambia el layout a vertical
            margin={{ right: 20 }} // Añade margen derecho para que los labels no se corten
          >
            <CartesianGrid horizontal={false} />

            {/* 3. Cambia los ejes: XAxis pasa a ser YAxis para los nombres */}
            <YAxis
              dataKey="empresa"
              type="category"
              tickLine={true}
              tickMargin={5}
              axisLine={true}
              width={180} // Ajusta el ancho según la longitud de tus nombres
              tickFormatter={(value) => value.slice(0, 38)}
            />

            {/* 4. YAxis pasa a ser XAxis para los números */}
            <XAxis dataKey="cantidad" type="number" hide />

            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />

            <Bar dataKey="cantidad" fill="var(--chart-bar-color-cantidad)" radius={3}>
              <LabelList
                dataKey="cantidad"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}
