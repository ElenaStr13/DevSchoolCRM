import api from '../api/axios';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export class OrdersService {
    static async findPaginated(query: PaginationQueryDto) {
        const res = await api.get('/orders', { params: query });

        return {
            data: res.data.data,
            totalCount: res.data.meta.total,
        };
    }
}