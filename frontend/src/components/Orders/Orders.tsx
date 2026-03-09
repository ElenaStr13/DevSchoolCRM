import React, { useEffect, useState, useRef } from "react";
import {
    Button, Dialog, DialogContent, DialogActions, DialogTitle, Table, TableBody, TableCell, TableContainer,
    TableRow, Typography, Paper, CircularProgress, Box
} from "@mui/material";
import { StyledTableHead } from "./Orders.styles";
import { OrdersService } from "../../services/order.service";
import { OrderDto } from "../../dto/order.dto";
import { PaginationQueryDto } from "../../dto/pagination-query.dto";
import Pagination from "../../components/Pagination/Pagination";
import OrderDetails from "../../components/OrdersDetails/OrderDetails";
import EditOrderModal from "../../components/Edit/EditOrderModal";
import OrdersFilter from "../../components/OrdersFilter/OrdersFilter";
import {Manager} from "../../types/manager.type";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const filters = Object.fromEntries(searchParams.entries());
    const page = Number(searchParams.get("page")) || 1;
    const take = Number(searchParams.get("take")) || 25;
    const sortBy = searchParams.get("sortBy") || "id";
    const order = (searchParams.get("order") as "ASC" | "DESC") || "ASC";
    const [total, setTotal] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
    const detailsRef = useRef<HTMLDivElement | null>(null);
    const currentUserRaw = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUser = { ...currentUserRaw, id: Number(currentUserRaw.id) };
    const [editOpen, setEditOpen] = useState(false);


    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [currentManager, ] = useState<Manager | null>(null);
    const [managerStats, ] = useState<Record<string, number> | null>(null);

    const totalPages = Math.ceil(total / take);

    // Завантаження заявок
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const query: PaginationQueryDto = {
                    page,
                    take,
                    sortBy,
                    order,
                    ...filters,
                };


                const { data, totalCount } = await OrdersService.findPaginated(query);

                setOrders(data);
                setTotal(totalCount);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [searchParams]);

   // Обробка сортування
    const handleSort = (column: string) => {
        const params = Object.fromEntries(searchParams);

        if (sortBy === column) {
            params.order = order === "ASC" ? "DESC" : "ASC";
        } else {
            params.sortBy = column;
            params.order = "ASC";
        }

        setSearchParams(params);
    };

    // Клік по рядку
    const handleRowClick = async (order: OrderDto) => {
        if (selectedOrder?.id === order.id) {
            setSelectedOrder(null);
            return;
        }

        try {
            const detailed = await OrdersService.findOne(order.id);
            setSelectedOrder(detailed);

            // Плавний скрол до блоку деталей
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 200);
        } catch (err) {
            console.error("Помилка при завантаженні деталей:", err);
        }
    };

    // Додавання коментаря
    const handleAddComment = async (
        orderId: number,
        text: string
    ): Promise<{ author: string; text: string; createdAt: string }> => {
        try {
            const newComment = await OrdersService.addComment(orderId, text);

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev =>
                    prev
                        ? {
                            ...prev,
                            comments: prev.comments
                                ? [...prev.comments, newComment]
                                : [newComment],
                            managerUser: prev.managerUser || {
                                id: currentUser.id,
                                name: currentUser.name,
                                surname: currentUser.surname ?? "",
                            },
                            manager:
                                prev.manager ||
                                `${currentUser.name} ${currentUser.surname ?? ""}`.trim(),
                            status:
                                !prev.status || prev.status === "New"
                                    ? "In work"
                                    : prev.status,
                        }
                        : prev
                );
            }

            return newComment;
        } catch (err) {
            console.error("Помилка додавання коментаря:", err);
            throw err;
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = Object.fromEntries(searchParams);
        params.page = String(newPage);
        setSearchParams(params);
        // if (newPage > 0 && newPage <= totalPages) {
        //     setPage(newPage);
        // }
    };
    const handleEditOpen = (order: OrderDto) => {
        setSelectedOrder(order);
        setEditOpen(true);
    };



    const handleFilterChange = (newFilters: Record<string, any>) => {

        const params: Record<string, string> = {};
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                params[key] = String(value);
            }
        });
        params.page = "1"; // скидаємо сторінку
        setSearchParams(params);
    };


    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ p: 2 }}>
            <OrdersFilter filters={filters} onChange={handleFilterChange} />
            <TableContainer component={Paper}>
                <Table>
                    <StyledTableHead>
                        <TableRow>
                            {[
                                "id", "name", "surname", "email", "phone", "age",
                                "course", "course_format", "course_type",
                                "status", "sum", "manager", "groupName", "alreadyPaid", "created_at",
                            ].map((col) => (
                                <TableCell
                                    key={col}
                                    onClick={() => handleSort(col)}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontWeight: sortBy === col ? "bold" : "normal",
                                    }}
                                >
                                    {col}
                                    {sortBy === col && (order === "ASC" ? " ↑" : " ↓")}
                                </TableCell>
                            ))}
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {orders.map((row) => (
                            <React.Fragment key={row.id}>
                                {/* Основний рядок */}
                                <TableRow
                                    hover
                                    onClick={() => handleRowClick(row)}
                                    style={{
                                        backgroundColor: selectedOrder?.id === row.id ? "#e3f2fd" : "transparent",
                                        cursor: "pointer",
                                    }}
                                >
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.surname}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>{row.phone}</TableCell>
                                    <TableCell>{row.age}</TableCell>
                                    <TableCell>{row.course}</TableCell>
                                    <TableCell>{row.course_format}</TableCell>
                                    <TableCell>{row.course_type}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{row.sum}</TableCell>

                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        {/*{row.manager  || ""}*/}
                                        {row.managerUser
                                            ? `${row.managerUser.name} ${row.managerUser.surname ?? ""}`.trim()
                                            : (row.manager || "")
                                        }
                                    </TableCell>

                                    <TableCell>{row.group?.name || "-"}</TableCell>
                                    <TableCell>{row.alreadyPaid}</TableCell>
                                    <TableCell>
                                        {row.created_at
                                            ? new Date(row.created_at).toLocaleDateString("uk-UA")
                                            : ""}
                                    </TableCell>
                                </TableRow>

                                {/* Вставка блоку деталей прямо під рядком */}
                                {selectedOrder?.id === row.id && (
                                    <TableRow>
                                        <TableCell colSpan={14} style={{ padding: 0 }}>
                                            <OrderDetails
                                                order={selectedOrder}
                                                currentUser={currentUser}
                                                onAddComment={handleAddComment}
                                                onEditOpen={handleEditOpen}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Пагінація */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {selectedOrder && (
                <EditOrderModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    order={selectedOrder}
                    currentUser={currentUser}
                    onUpdate={(updatedOrder) => {
                        setSelectedOrder(updatedOrder);
                        setEditOpen(false);
                    }}
            />
            )}

            <Dialog
                open={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Статистика менеджера
                    {currentManager && (
                        <Typography variant="subtitle2">
                            {currentManager.name} {currentManager.surname}
                        </Typography>
                    )}
                </DialogTitle>

                <DialogContent>
                    {managerStats ? (
                        Object.entries(managerStats).map(([status, count]) => (
                            <Box
                                key={status}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    py: 1,
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <Typography>{status}</Typography>
                                <Typography fontWeight="bold">{count}</Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography>Немає даних</Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setStatsModalOpen(false)}>Закрити</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
