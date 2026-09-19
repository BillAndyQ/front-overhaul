"use client"

import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A donut chart with text"





export function ChartPieDonutText({ data }: { data: dataDashboard }) {

  const chartData = [
    { browser: "pendiente", visitors: data.ot_equipos_pending, fill: "var(--color-state-pending)" },
    { browser: "en proceso", visitors: data.ot_equipos_procesing, fill: "var(--color-state-processing)" },
    { browser: "abierta", visitors: data.ot_equipos_abierta, fill: "var(--color-state-open)" },
    { browser: "cerrado", visitors: data.ot_equipos_cerrada, fill: "var(--color-state-closed)" },
  ]

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    pendiente: {
      label: `Pendiente (${data.ot_equipos_pending})`,
      color: "var(--chart-1)",
    },
    "en proceso": {
      label: `En proceso (${data.ot_equipos_procesing})`,
      color: "var(--chart-2)",
    },
    cerrado: {
      label: `Cerrado (${data.ot_equipos_cerrada})`,
      color: "var(--chart-3)",
    },
    abierta: {
      label: `Abiertas (${data.ot_equipos_abierta})`,
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Órdenes por estado</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 m-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    className="fill-white text-xs font-bold"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 14}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {data.ot_equipos_totales}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 10}
                          className="fill-muted-foreground "
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent className="-translate-y-2 flex-wrap gap-2" />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}
