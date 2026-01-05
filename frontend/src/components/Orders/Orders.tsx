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
import { AdminService } from "../../services/admin.service";
import {Manager} from "../../types/manager.type";

export default function Orders() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [take, setTake] = useState(25);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState<string>("id");
    const [order, setOrder] = useState<"ASC" | "DESC">("ASC");
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
    const detailsRef = useRef<HTMLDivElement | null>(null);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [editOpen, setEditOpen] = useState(false);
    const [managersList, setManagersList] = useState<Manager[]>([]);

    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [currentManager, setCurrentManager] = useState<Manager | null>(null);
    const [managerStats, setManagerStats] = useState<Record<string, number> | null>(null);

    const totalPages = Math.ceil(total / take);

    useEffect(() => {
        localStorage.setItem("ordersFilters", JSON.stringify(filters));
    }, [filters]);

    // Завантаження заявок
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const cleanedFilters = Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
                );
                const query: PaginationQueryDto = { page, take, sortBy, order, ...cleanedFilters };


                const { data, totalCount } = await OrdersService.findPaginated(query);

                 setOrders(data);
                 setTotal(totalCount);

                const params = new URLSearchParams({
                    page: page.toString(),
                    take: take.toString(),
                    sortBy,
                    order,
                });
                window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                // console.log('Фільтри перед відправкою:', filters);
                // console.log('Повний query об’єкт:', query);
            } catch (error) {
                console.error("Помилка завантаження заявок:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, take, sortBy, order, filters]);

    // Обробка сортування
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setOrder(order === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(column);
            setOrder("ASC");
        }
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
    const handleAddComment: (
        orderId: number,
        text: string
    ) => Promise<{ author: string; text: string; createdAt: string }> = async (
        orderId,
        text
    ) => {
        try {
            // Викликаємо бекенд і отримуємо новий коментар
            const newComment = await OrdersService.addComment(orderId, text);

            // Додаємо новий коментар у локальний selectedOrder
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({
                    ...prev!,
                    comments: prev?.comments ? [...prev.comments, newComment] : [newComment],
                }));
            }

            // Оновлюємо таблицю замовлень (не обов'язково робити це після кожного коментаря)
            const query: PaginationQueryDto = { page, take, sortBy, order };
            const { data } = await OrdersService.findPaginated(query);
            setOrders(data);
            // Повертаємо новий коментар для OrderDetails
            return newComment;
        } catch (err) {
            console.error("Помилка додавання коментаря:", err);
            return { author: "Unknown", text, createdAt: new Date().toISOString() };
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };
    const handleEditOpen = (order: OrderDto) => {
        setSelectedOrder(order);
        setEditOpen(true);
    };

    //список менеджерів
    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const data = await AdminService.getAllManagers();
                setManagersList(data);
            } catch (e) {
                console.error("Помилка завантаження менеджерів:", e);
            }
        };

        if (currentUser.role === "admin") {
            fetchManagers();
        }
    }, []);

    const handleAssignManager = async (orderId: number, managerName: string) => {
        try {
            await OrdersService.assignManager(orderId, managerName);

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, manager: managerName } : order
                )
            );
        } catch (error) {
            console.error("Помилка призначення менеджера:", error);
        }
    };


    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ p: 2 }}>
            <OrdersFilter onFilterChange={setFilters} />
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
                                        {currentUser.role === "admin" ? (
                                            <select
                                                value={row.manager || ""}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleAssignManager(row.id, e.target.value)}
                                                style={{ padding: "4px", borderRadius: "4px" }}
                                            >
                                                <option value="">— Не призначено —</option>
                                                {managersList.map((m: any) => (
                                                    <option key={m.id} value={m.name}>
                                                        {m.name.trim()}
                                                        {/*{m.name} {m.surname}*/}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            row.manager || "-"
                                        )}
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
