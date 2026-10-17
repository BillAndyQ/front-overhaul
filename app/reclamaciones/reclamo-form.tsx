"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch, type FieldError as RHFFieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPARTAMENTOS,
  ReclamoCrearSchema,
  TIPOS_CONSUMO,
  TIPOS_DOCUMENTO,
  type ReclamoCrearInput,
} from "@/lib/reclamo-schema";
import { cn } from "@/lib/utils";

const valoresIniciales: Partial<ReclamoCrearInput> = {
  nombres: "",
  apellidos: "",
  numero_documento: "",
  celular: "",
  provincia: "",
  distrito: "",
  direccion: "",
  referencia: "",
  correo: "",
  menor_edad: "no",
  apoderado_nombre: "",
  apoderado_documento: "",
  numero_pedido: "",
  fecha_incidente: "",
  monto: "",
  descripcion_bien: "",
  detalle: "",
  pedido: "",
};

const fechaLarga = (fecha: Date) =>
  fecha.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function Campo({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: RHFFieldError;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function ReclamoForm() {
  const [numeroHoja, setNumeroHoja] = useState<string>("------");
  const [enviado, setEnviado] = useState<{ numero: string; fecha: Date; correo: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,

    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReclamoCrearInput>({
    resolver: zodResolver(ReclamoCrearSchema),
    defaultValues: valoresIniciales,
  });

  const esMenor = useWatch({ control, name: "menor_edad" }) === "si";

  const cargarNumero = () =>
    fetch("/api/reclamaciones")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { siguiente: string }) => setNumeroHoja(data.siguiente))
      .catch(() => setNumeroHoja("------"));

  useEffect(() => {
    cargarNumero();
  }, []);

  async function onSubmit(values: ReclamoCrearInput) {
    try {
      const res = await fetch("/api/reclamaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "No se pudo registrar el reclamo");
        return;
      }
      setEnviado({ numero: data.numero, fecha: new Date(data.fecha_emision), correo: values.correo });
      toast.success(`Hoja de reclamación N° ${data.numero} registrada`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error de conexión. Inténtalo nuevamente.");
    }
  }

  if (enviado) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="mx-auto size-12 text-green-600" />
          <CardTitle className="text-xl">Reclamo registrado</CardTitle>
          <CardDescription>
            Tu hoja de reclamación fue registrada el {fechaLarga(enviado.fecha)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-lg border bg-muted/50 px-6 py-3">
            <p className="text-xs uppercase text-muted-foreground">N° de hoja</p>
            <p className="font-mono text-2xl font-semibold">{enviado.numero}</p>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Guarda este número para dar seguimiento. Te responderemos a <strong>{enviado.correo}</strong> en
            un plazo no mayor a quince (15) días calendario.
          </p>
          <div className="flex flex-wrap justify-center gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Imprimir
            </Button>
            <Button
              onClick={() => {
                reset(valoresIniciales);
                setEnviado(null);
                cargarNumero();
              }}
            >
              Registrar otro reclamo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Libro de Reclamación Virtual</CardTitle>
            <CardDescription className="mt-1">
              Fecha de emisión de hoja de reclamo: {fechaLarga(new Date())}
            </CardDescription>
          </div>
          <div className="shrink-0 rounded-lg border px-4 py-2 text-center">
            <p className="text-xs uppercase text-muted-foreground">N° de hoja</p>
            <p className="font-mono text-lg font-semibold">{numeroHoja}</p>
          </div>
        </div>
        <p className="text-center text-sm font-semibold tracking-wide">HOJA DE RECLAMACIÓN</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
          <Seccion numero={1} titulo="Identificación del consumidor reclamante">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="nombres" label="Nombres:" error={errors.nombres}>
                <Input id="nombres" autoComplete="given-name" {...register("nombres")} />
              </Campo>
              <Campo id="apellidos" label="Apellidos:" error={errors.apellidos}>
                <Input id="apellidos" autoComplete="family-name" {...register("apellidos")} />
              </Campo>

              <Campo id="tipo_documento" label="Tipo de Documento:" error={errors.tipo_documento}>
                <Controller
                  control={control}
                  name="tipo_documento"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="tipo_documento" className="w-full">
                        <SelectValue placeholder="—Por favor, elige una opción—" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_DOCUMENTO.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Campo>
              <Campo id="numero_documento" label="N° Documento:" error={errors.numero_documento}>
                <Input id="numero_documento" {...register("numero_documento")} />
              </Campo>

              <Campo id="celular" label="Celular:" hint="Podremos comunicarnos" error={errors.celular}>
                <Input id="celular" type="tel" inputMode="tel" autoComplete="tel" {...register("celular")} />
              </Campo>
              <Campo id="correo" label="Correo:" hint="Recibirás este documento" error={errors.correo}>
                <Input id="correo" type="email" autoComplete="email" {...register("correo")} />
              </Campo>

              <Campo id="departamento" label="Departamento:" error={errors.departamento}>
                <Controller
                  control={control}
                  name="departamento"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="departamento" className="w-full">
                        <SelectValue placeholder="—Por favor, elige una opción—" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTAMENTOS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Campo>
              <Campo id="provincia" label="Provincia" error={errors.provincia}>
                <Input id="provincia" {...register("provincia")} />
              </Campo>
              <Campo id="distrito" label="Distrito" error={errors.distrito}>
                <Input id="distrito" {...register("distrito")} />
              </Campo>
              <Campo id="direccion" label="Dirección:" error={errors.direccion}>
                <Input
                  id="direccion"
                  autoComplete="street-address"
                  placeholder="Av Psj Calle Jr, N° Mz Lt Int"
                  {...register("direccion")}
                />
              </Campo>
              <Campo id="referencia" label="Referencia:" error={errors.referencia} className="sm:col-span-2">
                <Input
                  id="referencia"
                  placeholder="Plaza, Colegio, Paradero, etc"
                  {...register("referencia")}
                />
              </Campo>

              <fieldset className="flex flex-col gap-2 sm:col-span-2">
                <legend className="mb-1.5 text-sm font-medium">
                  ¿Es menor de edad? <span className="text-destructive">*</span>
                </legend>
                <div className="flex gap-6">
                  {(["no", "si"] as const).map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm">
                      <input type="radio" value={v} className="size-4 accent-primary" {...register("menor_edad")} />
                      {v === "no" ? "No" : "Sí"}
                    </label>
                  ))}
                </div>
              </fieldset>

              {esMenor && (
                <>
                  <Campo
                    id="apoderado_nombre"
                    label="Nombre del padre, madre o apoderado:"
                    error={errors.apoderado_nombre}
                  >
                    <Input id="apoderado_nombre" {...register("apoderado_nombre")} />
                  </Campo>
                  <Campo
                    id="apoderado_documento"
                    label="N° Documento del apoderado:"
                    error={errors.apoderado_documento}
                  >
                    <Input id="apoderado_documento" {...register("apoderado_documento")} />
                  </Campo>
                </>
              )}
            </div>
          </Seccion>

          <Separator />

          <Seccion numero={2} titulo="Identificación del Bien Contratado">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="tipo_consumo" label="Tipo de consumo:" error={errors.tipo_consumo}>
                <Controller
                  control={control}
                  name="tipo_consumo"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="tipo_consumo" className="w-full">
                        <SelectValue placeholder="—Por favor, elige una opción—" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CONSUMO.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Campo>
              <Campo
                id="numero_pedido"
                label="N° de pedido:"
                hint="Recibo, boleta, guía, etc"
                error={errors.numero_pedido}
              >
                <Input id="numero_pedido" {...register("numero_pedido")} />
              </Campo>
              <Campo id="fecha_incidente" label="Fecha del incidente:" error={errors.fecha_incidente}>
                <Input id="fecha_incidente" type="date" max={hoy()} {...register("fecha_incidente")} />
              </Campo>
              <Campo
                id="monto"
                label="Monto del producto o servicio contratado objeto del reclamo:"
                error={errors.monto}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    S/
                  </span>
                  <Input id="monto" inputMode="decimal" placeholder="0.00" className="pl-8" {...register("monto")} />
                </div>
              </Campo>
              <Campo id="descripcion_bien" label="Descripción:" error={errors.descripcion_bien} className="sm:col-span-2">
                <Textarea
                  id="descripcion_bien"
                  rows={3}
                  placeholder="Describa correcta y solamente de qué se trata el producto/servicio ..."
                  {...register("descripcion_bien")}
                />
              </Campo>
            </div>
          </Seccion>

          <Separator />

          <Seccion numero={3} titulo="Detalle de la reclamación y pedido del consumidor">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-medium">
                Tipo de Reclamo: <span className="text-destructive">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    valor: "Reclamo",
                    texto: "Disconformidad relacionada a los productos o servicios.",
                  },
                  {
                    valor: "Queja",
                    texto:
                      "Disconformidad no relacionada a los productos o servicios o malestar o descontento respecto a la atención al público.",
                  },
                ].map((op) => (
                  <label
                    key={op.valor}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input
                      type="radio"
                      value={op.valor}
                      className="mt-0.5 size-4 accent-primary"
                      {...register("tipo_reclamo")}
                    />
                    <span>
                      <strong>{op.valor}:</strong> {op.texto}
                    </span>
                  </label>
                ))}
              </div>
              {errors.tipo_reclamo && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.tipo_reclamo.message}
                </p>
              )}
            </fieldset>

            <Campo id="detalle" label="Detalle de la reclamación o queja:" error={errors.detalle}>
              <Textarea
                id="detalle"
                rows={5}
                placeholder="Describa correctamente sólo su queja o reclamación, cómo recibió el producto/servicio o atención ..."
                {...register("detalle")}
              />
            </Campo>
            <Campo
              id="pedido"
              label="Pedido concreto del consumidor respecto al hecho que motiva el reclamo o queja:"
              error={errors.pedido}
            >
              <Textarea id="pedido" rows={3} placeholder="Qué solicita con su queja/reclamo ..." {...register("pedido")} />
            </Campo>
          </Seccion>

          <Separator />

          <Seccion numero={4} titulo="Observaciones y acciones adoptadas por el proveedor">
            <Textarea
              disabled
              rows={3}
              aria-label="Observaciones y acciones adoptadas por el proveedor"
              placeholder="Describa la solución provista por el negocio/empresa ... (completado por el proveedor)"
            />
          </Seccion>

          <div className="flex flex-col gap-1.5">
            <Controller
              control={control}
              name="conformidad"
              render={({ field }) => (
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(c) => field.onChange(c === true ? true : undefined)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="text-destructive">*</span> Me encuentro conforme con los términos de mi reclamo o
                    queja.
                  </span>
                </label>
              )}
            />
            {errors.conformidad && (
              <p role="alert" className="text-xs text-destructive">
                {errors.conformidad.message}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-2 rounded-lg bg-muted/60 p-4 text-xs text-muted-foreground">
            <li>
              * En caso que el consumidor no consigne como mínimo su nombre, DNI, domicilio o correo electrónico y el
              detalle del reclamo o queja, de conformidad con el artículo 5 del Reglamento del Libro de Reclamaciones,
              estos se considerarán como no presentados.
            </li>
            <li>
              * La formulación del reclamo no excluye el recurso a otros medios de resolución de controversias ni es un
              requisito previo para presentar una denuncia ante el Indecopi.
            </li>
            <li>
              * El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días calendario,
              pudiendo extender el plazo hasta quince días.
            </li>
            <li>
              * Con la firma de este documento, el cliente autoriza a ser contactado después de la tramitación de la
              reclamación para evaluar la calidad y satisfacción del proceso de atención de reclamaciones.
            </li>
          </ul>

          <Button type="submit" size="lg" disabled={isSubmitting} className="self-end">
            {isSubmitting && <Loader2 className="animate-spin" />}
            Enviar reclamo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
