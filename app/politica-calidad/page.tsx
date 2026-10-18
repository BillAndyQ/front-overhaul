import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Calidad | Overhaul Mining",
  description:
    "Política del Sistema de Gestión de la Calidad de Overhaul Mining E.I.R.L.",
};

const documento = {
  codigo: "OM-SGC-006",
  revision: "02",
  fecha: "21/08/2026",
  area: "Izaje",
};

const compromisos = [
  "Satisfacer los requisitos y expectativas pertinentes de nuestros clientes, asegurando servicios confiables, oportunos y técnicamente conformes.",
  "Cumplir los requisitos legales, reglamentarios, contractuales y demás requisitos aplicables a los servicios, manteniendo objetivos de calidad medibles y coherentes con la dirección estratégica de la organización.",
  "Mejorar continuamente la eficacia del Sistema de Gestión de la Calidad y el desempeño de nuestros procesos mediante su seguimiento, evaluación y acciones de mejora.",
  "Fortalecer las competencias y la toma de conciencia de nuestros colaboradores, proporcionando los recursos necesarios para asegurar la calidad de los servicios.",
];

export default function PoliticaCalidadPage() {
  return (
    <div className="min-h-full bg-muted/40">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Ir al contenido
      </a>

      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al sitio principal
          </Link>
        </div>
      </header>

      <main id="contenido" className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-xl border bg-background p-6 shadow-sm sm:p-10">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Sistema de Gestión de la Calidad
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Política de Calidad
          </h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Código</dt>
              <dd className="font-medium">{documento.codigo}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Revisión</dt>
              <dd className="font-medium">{documento.revision}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Fecha</dt>
              <dd className="font-medium">{documento.fecha}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Área</dt>
              <dd className="font-medium">{documento.area}</dd>
            </div>
          </dl>

          <div className="mt-8 space-y-5 leading-7">
            <p>
              <strong>Overhaul Mining E.I.R.L.</strong> brinda Servicios de
              Certificación de Ensayos no Destructivos, Servicios de
              Certificación de Operadores y Evaluaciones de Izaje y Servicios
              de Mantenimiento Industrial. Orientamos nuestras actividades a
              cumplir los requisitos del cliente y los requisitos legales,
              reglamentarios y técnicos aplicables, mediante personal
              competente y procesos controlados.
            </p>
            <p>
              Por ello, en <strong>Overhaul Mining</strong>, la Alta Dirección,
              a través de su Sistema de Gestión de la Calidad, asume los
              siguientes compromisos:
            </p>

            <ul className="space-y-3">
              {compromisos.map((compromiso) => (
                <li key={compromiso} className="flex gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                  <span>{compromiso}</span>
                </li>
              ))}
            </ul>

            <p>
              Esta Política de Calidad proporciona el marco de referencia para
              establecer y revisar los objetivos de calidad, se comunica al
              personal y se mantiene disponible para las partes interesadas
              pertinentes.
            </p>
          </div>

          <div className="mt-10 border-t pt-6 text-center">
            <p className="font-medium">Ricardo Orlando Luycho Huingo</p>
            <p className="text-sm text-muted-foreground">
              Gerencia General – Overhaul Mining
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cajamarca, 21 de agosto de 2026
            </p>
          </div>
        </article>
      </main>

      <footer className="border-t bg-background px-4 py-4 text-center text-sm text-muted-foreground">
        <p>OVERHAUL MINING E.I.R.L. · RUC 20602129749</p>
        <p>
          Av. Manco Cápac N° 1346 Baños del Inca, Cajamarca · Av. Universitaria
          N° 3102 Los Olivos, Lima
        </p>
        <p>
          Contacto: 976225732 ·{" "}
          <a
            href="mailto:mantenimiento@overhaulmining.com"
            className="hover:text-foreground"
          >
            mantenimiento@overhaulmining.com
          </a>
        </p>
      </footer>
    </div>
  );
}
