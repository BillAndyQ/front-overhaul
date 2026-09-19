"use client"

import {
  FileTextIcon,
  MapPinIcon,
  PlusIcon,
  TruckIcon,
  UploadCloudIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, FieldValues, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FormValues } from "./schema"

const TIPOS_SERVICIO = [
  "NDT",
  "Izaje",
  "Mantto Industrial",
  "Faraday",
  "Metrología",
  "Cálculo estructural",
] as const


interface AddEquipoModalProps {
  onSave: (data: any) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  methods: UseFormReturn<FieldValues>;
  updatedEquipo : boolean
}

export function AddEquipoModal({ onSave, open, setOpen, methods, updatedEquipo, setupdatedEquipo }: AddEquipoModalProps){
  const {
    register,
    handleSubmit,
    control,
    reset,
  } = methods

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string)
      }
    })

    onSave?.(formData)
    setOpen(false)
    reset()
  }

  useEffect(()=>{
    reset()
  },[open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="text-xs" onClick={() => setupdatedEquipo(false)}>
          <PlusIcon data-icon="inline-start" />
          Equipo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          {updatedEquipo ? (
          <DialogTitle>Actualizar equipo</DialogTitle>
          ):(
          <DialogTitle>Agregar nuevo equipo</DialogTitle>
          )}
          <DialogDescription>
            Registra los datos del servicio y adjunta la documentación
            correspondiente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="px-6 pb-6">
            {/* Datos del equipo */}
            <FieldSet>
              <FieldLegend variant="label" className="flex items-center gap-2">
                <TruckIcon className="size-4 text-muted-foreground" />
                Datos del equipo
              </FieldLegend>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="tipo_unidad">Tipo de unidad</FieldLabel>
                  <Controller
                    control={control}
                    name="tipo_unidad"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="tipo_unidad" className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Camión">Camión</SelectItem>
                            <SelectItem value="Grúa Movil">Grúa Movil</SelectItem>
                            <SelectItem value="Grúa Puente">Grúa Puente</SelectItem>
                            <SelectItem value="Grúa Articulada">Grúa Articulada</SelectItem>
                            <SelectItem value="Montacargas">Montacargas</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="placa">Placa</FieldLabel>
                  <Input id="placa" {...register("placa")} placeholder="Ej. ABC-123" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="ubicacion">Ubicación</FieldLabel>
                  <Input
                    id="ubicacion"
                    {...register("ubicacion")}
                    placeholder="Planta / sede"
                  />
                  <MapPinIcon className="sr-only" />
                </Field>
              </div>
            </FieldSet>

            <FieldSeparator />

            {/* Detalle del servicio */}
            <FieldSet>
              <FieldLegend variant="label" className="flex items-center gap-2">
                <WrenchIcon className="size-4 text-muted-foreground" />
                Detalle del servicio
              </FieldLegend>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="tipo_servicio">Tipo de servicio</FieldLabel>
                  <Controller
                    control={control}
                    name="tipo_servicio"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="tipo_servicio" className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {TIPOS_SERVICIO.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="fecha_servicio">Fecha de servicio</FieldLabel>
                  <Input
                    id="fecha_servicio"
                    type="date"
                    {...register("fecha_servicio")}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="inspector">Inspector</FieldLabel>
                  <Input
                    id="inspector"
                    {...register("inspector")}
                    placeholder="Nombre"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="descripcion">
                  Descripción del servicio
                </FieldLabel>
                <Textarea
                  id="descripcion"
                  {...register("descripcion")}
                  rows={4}
                  placeholder="Describe el alcance y observaciones del servicio…"
                />
              </Field>
            </FieldSet>

            <FieldSeparator />

            {/* Documentación */}
            <FieldSet>
              <FieldLegend variant="label" className="flex items-center gap-2">
                <FileTextIcon className="size-4 text-muted-foreground" />
                Documentación
              </FieldLegend>
              <FieldDescription>
                Adjunta los archivos en formato PDF. Límite de 200 MB por
                archivo.
              </FieldDescription>

              <div className="grid grid-cols-1 gap-3">
                <Controller
                  control={control}
                  name="informeCampo"
                  render={({ field }) => (
                    <FileUpload
                      label="Informe de campo"
                      file={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="informeFinal"
                  render={({ field }) => (
                    <FileUpload
                      label="Informe final"
                      file={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="certificado"
                  render={({ field }) => (
                    <FileUpload
                      label="Certificado"
                      file={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit">Guardar equipo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileUpload({
  label,
  file,
  onChange,
}: {
  label: string
  file: File | null
  onChange: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function pickFile(list: FileList | null) {
    const next = list?.[0]
    if (next && next.type === "application/pdf") {
      onChange(next)
    }
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileTextIcon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span className="truncate text-sm font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatSize(file.size)}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange(null)}
        >
          <XIcon />
          <span className="sr-only">Quitar {label}</span>
        </Button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        pickFile(e.dataTransfer.files)
      }}
      className={cn(
        "flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed bg-background px-4 py-5 text-center transition-colors outline-none hover:border-ring/60 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        dragging && "border-ring bg-accent/60"
      )}
    >
      <UploadCloudIcon className="size-5 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">
        Arrastra y suelta el archivo aquí o haz clic para buscar · PDF
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => pickFile(e.target.files)}
      />
    </button>
  )
}
