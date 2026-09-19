// http://localhost:8000/api/v1/dashboard/equipos
import { api } from "./api";

export async function getDataDashboard(date_start: string | null = null, date_end: string | null = null) {
    const { data } = await api.get(`/api/v1/dashboard/equipos`);
    return data

};