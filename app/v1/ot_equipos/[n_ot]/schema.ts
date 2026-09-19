import z from "zod"

export const formSchema = z.object({
  tipo_unidad: z.string().min(1, "Campo obligatorio"),
  placa: z.string().min(1, "Campo obligatorio"),
  ubicacion: z.string().min(1, "Campo obligatorio"),
  tipo_servicio: z.string().min(1, "Campo obligatorio"),
  fecha_servicio: z.string().min(1, "Campo obligatorio"),
  inspector: z.string().min(1, "Campo obligatorio"),
  descripcion: z.string().optional(),
  informeCampo: z.custom<File | null>().nullable(),
  informeFinal: z.custom<File | null>().nullable(),
  certificado: z.custom<File | null>().nullable(),
})

export type FormValues = z.infer<typeof formSchema>