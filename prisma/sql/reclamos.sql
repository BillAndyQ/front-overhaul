-- Tabla del Libro de Reclamaciones.
-- Se crea con SQL manual (no `prisma db push`): la base contiene tablas
-- administradas por otros servicios que no están en schema.prisma.
CREATE TABLE IF NOT EXISTS reclamos (
  numero                  SERIAL PRIMARY KEY,
  fecha_emision           TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

  nombres                 TEXT NOT NULL,
  apellidos               TEXT NOT NULL,
  tipo_documento          TEXT NOT NULL,
  numero_documento        TEXT NOT NULL,
  celular                 TEXT NOT NULL,
  departamento            TEXT NOT NULL,
  provincia               TEXT NOT NULL,
  distrito                TEXT NOT NULL,
  direccion               TEXT NOT NULL,
  referencia              TEXT NOT NULL,
  correo                  TEXT NOT NULL,
  menor_edad              BOOLEAN NOT NULL DEFAULT false,
  apoderado_nombre        TEXT,
  apoderado_documento     TEXT,

  tipo_consumo            TEXT NOT NULL,
  numero_pedido           TEXT NOT NULL,
  fecha_incidente         DATE NOT NULL,
  monto                   DECIMAL(12, 2) NOT NULL,
  descripcion_bien        TEXT NOT NULL,

  tipo_reclamo            TEXT NOT NULL,
  detalle                 TEXT NOT NULL,
  pedido                  TEXT NOT NULL,

  observaciones_proveedor TEXT,
  estado                  TEXT NOT NULL DEFAULT 'pendiente',
  updated_at              TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);
