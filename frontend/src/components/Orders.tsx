import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { OrdersService } from '../services/order.service';
import { OrderDto } from '../dto/order.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { Box } from '@mui/material';


export default function Orders() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [take, setTake] = useState(25);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const query: PaginationQueryDto = {
                    page: Number(page),
                    take: Number(take),
                };
                const { data, totalCount } = await OrdersService.findPaginated(query);
                setOrders(data);
                setTotal(totalCount);
            } catch (error) {
                console.error('Помилка завантаження заявок:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, take]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= Math.ceil(total / take)) {
            setPage(newPage);
        }
    };

    if (loading) return <p className="text-center mt-10">Завантаження...</p>;
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: "Ім'я", flex: 1 },
        { field: 'surname', headerName: 'Прізвище', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1.2 },
        { field: 'phone', headerName: 'Телефон', flex: 1 },
        { field: 'age', headerName: 'Вік', width: 80 },
        { field: 'course', headerName: 'Курс', flex: 1 },
        { field: 'course_format', headerName: 'Формат', flex: 1 },
        { field: 'course_type', headerName: 'Тип', flex: 1 },
        { field: 'status', headerName: 'Статус', flex: 1 },
        { field: 'sum', headerName: 'Сума', flex: 1 },
        { field: 'alreadyPaid', headerName: 'Оплачено', flex: 1 },
        { field: 'manager', headerName: 'Менеджер', flex: 1 },
        {
            field: 'groupName',
            headerName: 'Група',
            flex: 1,
            valueGetter: (params) => params.row.groups?.map((g: any) => g.name).join(', ') || '' // Адаптуй під структуру
        },
        {
            field: 'created_at',
            headerName: 'Дата створення',
            flex: 1.2,
            valueFormatter: (params: any) =>
                params.value ? new Date(params.value).toLocaleDateString('uk-UA') : '',
        },
    ];
    return (
        <Box sx={{ height: 600, width: '100%', p: 2 }}>
            <DataGrid
                rows={orders}
                columns={columns}
                paginationMode="server"
                rowCount={total}
                loading={loading}
                paginationModel={{ page, pageSize: take }}
                onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setTake(model.pageSize);
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
            />
        </Box>
    );
}
