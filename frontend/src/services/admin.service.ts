import api from '../api/axios';
import {Manager} from "../types/manager.type";

export class AdminService {
    static async getStatistics(): Promise<Record<string, number>> {
        const res = await api.get('/orders/statistics');
        return res.data;
    }

    static async getManagersPaginated(page = 1, take = 10): Promise<{
        data: Manager[];
        meta: { total: number; page: number; take: number; pages: number };
    }> {
        const res = await api.get('/managers/paginated', { params: { page, take } });
        return res.data;
    }

    static async getAllManagers(): Promise<Manager[]> {
        const res = await api.get<Manager[]>('/managers/list');
        return res.data;
    }

    static async createManager(data: { email: string; name: string; surname: string }) {
        return api.post('/auth/register', data);
    }

    static async activateManager(id: number) {
        const res = await api.patch(`/managers/${id}/activate`);
        return res.data;
    }

    static async recoveryLink(id: number) {
        const res = await api.post(`/managers/recovery-password/${id}`);
        return res.data;
    }

    static async banManager(id: number) {
        await api.post(`/managers/${id}/ban`);
    }

    static async unbanManager(id: number) {
        await api.post(`/managers/${id}/unban`);
    }

    static async getManagerStatistics(id: number) {
        const res = await api.get(`/managers/statistics/${id}`);
        return res.data;
    }

    static async recoveryPassword(id: number) {
        const res = await api.post(`/managers/recovery-password/${id}`);
        return res.data;
    }
}
