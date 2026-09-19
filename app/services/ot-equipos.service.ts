import { api } from "./api";

export interface Equipo {
    id: number;
    deleted: boolean;
}

export async function getEquipos(): Promise<Equipo[]> {
    const { data } = await api.get("/api/v1/ot-equipos");

    return data
        .filter((equipo: Equipo) => !equipo.deleted)
        .sort((a: Equipo, b: Equipo) => b.id - a.id);
}

export async function getEquiposByOT(n_ot: string) {
    const { data } = await api.get(`/api/v1/ot-equipos/${n_ot}/equipos`);
    return data
};