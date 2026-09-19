import { Button } from "@/components/ui/button";
import axios from "axios";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface FileDownloadButtonProps {
    url: string;
    label: string;
}

export function FileDownloadButton({ url, label }: FileDownloadButtonProps) {
    const handleDownload = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            // Si la URL es relativa, le anteponemos la base URL, si es absoluta asumimos que el backend la maneja
            const cleanUrl = url.replace(/^bucket\/?/, "");

            // Construimos la URL final
            const fullUrl = cleanUrl.startsWith("http") 
            ? cleanUrl 
            : `${API_URL}/files/${cleanUrl}`;
            
            const response = await axios.get(fullUrl, {
                responseType: "blob", // Importante para manejar archivos
            });

            // Crear un enlace temporal para descargar
            const blob = new Blob([response.data], { type: response.headers["content-type"] });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = url.split("/").pop() || "archivo";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success("Descarga iniciada");
        } catch (error) {
            console.error("Error al descargar:", error);
            toast.error("Error al descargar el archivo");
        }
    };

    if (!url) return <span className="text-gray-400 text-xs">Sin archivo</span>;

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            className="h-8 gap-2 text-xs"
        >
            <Download className="w-4 h-4" />
            {label}
        </Button>
    );
}
