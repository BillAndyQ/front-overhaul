import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReclamoForm from "./reclamo-form";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Libro de Reclamación Virtual",
};

export default function LibroReclamacionesPage() {
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
        <ReclamoForm />
      </main>

      <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground">
        Copyright © {new Date().getFullYear()} Reclamaciones
      </footer>
    </div>
  );
}
