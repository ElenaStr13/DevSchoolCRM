import api from '../api/axios';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { OrderDto } from '../dto/order.dto';

export class OrdersService {
    static async findPaginated(query: PaginationQueryDto) {
        const res = await api.get('/orders', { params: query });
        return {
            data: res.data.items,
            totalCount: res.data.total,
        };
    }

    static async findOne(id: number): Promise<OrderDto> {
        const res = await api.get(`/orders/${id}`);
        return res.data;
    }

    static async findMyPaginated(query: PaginationQueryDto) {
        const res = await api.get('/orders', { params: query });
        //const res = await api.get('/orders/my', { params: query });
        return {
            data: res.data.items,
            totalCount: res.data.total,
        };
    }

    // Оновлено: завжди повертає об'єкт, ніколи undefined
    static async addComment(
        orderId: number,
        text: string
    ): Promise<{ author: string; text: string; createdAt: string }> {
        const res = await api.post(`/orders/${orderId}/comments`, { text });
        if (!res.data) {
            // На випадок, якщо сервер нічого не повернув
            return { author: "Unknown", text, createdAt: new Date().toISOString() };
        }

        return res.data as { author: string; text: string; createdAt: string };
    }

    static async updateOrder(
        orderId: number,
        data: Partial<OrderDto>,
        currentUser?: { name: string; role: string }
    ) {

        const res = await api.patch(
            `/orders/${orderId}`,
            data,
            currentUser
                ? {
                    headers: {
                        "x-user-name": currentUser.name,
                        "x-user-role": currentUser.role,
                    },
                }
                : undefined
        );

        return res.data;
    }


    static async getGroups(): Promise<{ id: number; name: string }[]> {
        const res = await api.get('/groups');
        return res.data; // повертаємо об'єкти {id, name}
    }

    static async createGroup(name: string): Promise<{ id: number; name: string }> {
        const res = await api.post('/groups', { name });
        return res.data;
    }

    static async getAllForExport(filters: Record<string, any>) {
        return api.post(
            "/orders/export",
            filters,
            {
                responseType: "blob", // <- обовʼязково, інакше файл зламається
            }
        );
    }

    static async assignManager(orderId: number, managerName: string) {
        const res = await api.patch(`/orders/${orderId}/manager`, {
            manager: managerName
        });
        return res.data;
    }
}