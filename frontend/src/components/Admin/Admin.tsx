import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import { AdminService } from "../../services/admin.service";
import "./Admin.css";
import {Manager} from "../../types/manager.type";

export default function Admin() {
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [managers, setManagers] = useState<any[]>([]);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [managerStats, setManagerStats] = useState<Record<string, number> | null>(null);
    const [currentManager, setCurrentManager] = useState<Manager | null>(null);

    const [page, setPage] = useState(1);
    const [take] = useState(10);
    const [totalPages, setTotalPages] = useState(1);


    const [form, setForm] = useState({
        email: "",
        name: "",
        surname: "",
        password: "",
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info",
    });

    const loadManagers = async (pageToLoad = page) => {
        const res = await AdminService.getManagersPaginated(pageToLoad, take);
        setManagers(res.data);
        setTotalPages(res.meta.pages);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const statsData = await AdminService.getStatistics();
                setStats(statsData);
                await loadManagers(page);
            } catch (err) {
                console.error("Помилка завантаження:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page]);


    const handleCreateManager = async () => {
        try {
            await AdminService.createManager(form);
            await loadManagers(1);
            setPage(1);
            setSnackbar({
                open: true,
                message: "Менеджера створено успішно",
                severity: "success",
            });
            //const updatedManagers = await AdminService.getManagers();
            //setManagers(updatedManagers);


            await loadManagers(1); // повертаємось на 1 сторінку
            setPage(1);

            setOpen(false);
            setForm({ email: "", name: "", surname: "", password: "" });
        } catch (e) {
            console.error("Error creating manager:", e);
            setSnackbar({
                open: true,
                message: "Помилка створення менеджера",
                severity: "error",
            });
        }
    };

    const handleActivate = async (id: number) => {
        try {
            const { activationLink } = await AdminService.activateManager(id);
            await loadManagers();
            // const { user: updatedUser, activationLink } =
            //     await AdminService.activateManager(id);
            // await loadManagers();
            // setManagers(
            //     managers.map((m) => (m.id === updatedUser.id ? updatedUser : m))
            // );
            await navigator.clipboard.writeText(activationLink);
            setSnackbar({
                open: true,
                message: "Activation link copied to clipboard",
                severity: "success",
            });
        } catch {
            setSnackbar({ open: true, message: "Activation error", severity: "error" });
        }
    };

    const handleRecovery = async (id: number) => {
        try {
            // const { user: updatedUser, recoveryLink } =
            //     await AdminService.recoveryPassword(id);
            // await loadManagers();
            // setManagers(
            //     managers.map((m) => (m.id === updatedUser.id ? updatedUser : m))
            // );
            const { recoveryLink } = await AdminService.recoveryPassword(id);
            await loadManagers();

            await navigator.clipboard.writeText(recoveryLink);
            setSnackbar({
                open: true,
                message: "Recovery password link copied to clipboard",
                severity: "success",
            });
        } catch {
            setSnackbar({
                open: true,
                message: "Error generating recovery password link",
                severity: "error",
            });
        }
    };


    const handleBan = async (id: number) => {
        await AdminService.banManager(id);
        await loadManagers();
        setSnackbar({ open: true, message: "Manager banned", severity: "warning" });
    };

    const handleUnban = async (id: number) => {
        await AdminService.unbanManager(id);
        await loadManagers();
        setSnackbar({ open: true, message: "Manager unbanned", severity: "success" });
    };

    const handleShowStats = async (id: number) => {
        const stats = await AdminService.getManagerStatistics(id);
        const manager = managers.find(m => m.id === id);
        setManagerStats(stats);
        setCurrentManager(manager);
        setStatsModalOpen(true);
    };

    if (loading)
        return (
            <Box className="admin-loader">
                <CircularProgress />
            </Box>
        );

    return (
        <Box className="admin-page">
            <Box className="admin-container">

                {/* 🔹 HEADER */}
                <Box className="admin-header">
                    <Typography variant="h4" className="admin-title">
                        Панель адміністратора
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setOpen(true)}
                        className="add-manager-btn"
                    >
                        + Додати менеджера
                    </Button>
                </Box>

                {/* 🔹 STATISTICS */}
                <Typography className="section-title">Статистика заявок</Typography>
                <Box className="stats-wrapper">
                    {Object.entries(stats || {}).map(([key, value]) => (
                        <Card key={key} className="admin-card">
                            <CardContent>
                                <Typography variant="subtitle2">{key}</Typography>
                                <Typography variant="h5" className="count-text">
                                    {value}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* 🔹 MANAGERS TABLE */}
                <Typography className="section-title">Список менеджерів</Typography>

                <TableContainer component={Paper} className="admin-table">
                    {/* 🔹 size="small" — компактна таблиця */}
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Surname</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last login</TableCell>
                                <TableCell>Orders</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {managers.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.id}</TableCell>
                                    <TableCell>{m.email}</TableCell>
                                    <TableCell>{m.name}</TableCell>
                                    <TableCell>{m.surname}</TableCell>

                                    {/* 🔹 STATUS BADGE */}
                                    <TableCell>
                                        <span className={`status-badge ${m.isActive ? "active" : "banned"}`}>
                                            {m.isActive ? "Active" : "Banned"}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        {m.last_login
                                            ? new Date(m.last_login).toLocaleString()
                                            : "—"}
                                    </TableCell>

                                    <TableCell>{m.totalOrders || 0}</TableCell>

                                    {/* 🔹 ACTIONS */}
                                    <TableCell align="center">
                                        <Box className="actions">
                                            {m.isActive ? (
                                                <Button size="small" variant="outlined" onClick={() => handleRecovery(m.id)}>
                                                    RECOVERY
                                                </Button>
                                            ) : (
                                                <Button size="small" variant="outlined" onClick={() => handleActivate(m.id)}>
                                                    ACTIVATE
                                                </Button>
                                            )}

                                            <Button size="small" variant="outlined" onClick={() => handleBan(m.id)}>
                                                BAN
                                            </Button>

                                            <Button size="small" variant="outlined" onClick={() => handleUnban(m.id)}>
                                                UNBAN
                                            </Button>

                                            <Button size="small" variant="outlined" onClick={() => handleShowStats(m.id)}>
                                                STATS
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className="pagination">
                    <Button
                        variant="outlined"
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                    >
                        ← Назад
                    </Button>

                    <Typography className="pagination-info">
                        Сторінка {page} з {totalPages}
                    </Typography>

                    <Button
                        variant="outlined"
                        disabled={page === totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        Вперед →
                    </Button>
                </Box>


                {/* 🔹 MODALS / SNACKBAR */}
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Створити менеджера</DialogTitle>
                    <DialogContent>
                        <TextField label="Email" fullWidth margin="dense"
                                   onChange={e => setForm({ ...form, email: e.target.value })}/>
                        <TextField label="Імʼя" fullWidth margin="dense"
                                   onChange={e => setForm({ ...form, name: e.target.value })}/>
                        <TextField label="Прізвище" fullWidth margin="dense"
                                   onChange={e => setForm({ ...form, surname: e.target.value })}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateManager}>Create</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={3000}
                          onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>

            {/*  MANAGER STATS MODAL */}
            <Dialog
                open={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Статистика менеджера
                    {currentManager && (
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                            {currentManager.name} {currentManager.surname}
                        </Typography>
                    )}
                </DialogTitle>

                <DialogContent dividers>
                    {managerStats ? (
                        Object.entries(managerStats).length > 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {Object.entries(managerStats).map(([status, count]) => (
                                    <Box
                                        key={status}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            background: "#f5f5f5",
                                        }}
                                    >
                                        <Typography>{status}</Typography>
                                        <Typography fontWeight="bold">{count}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography>Немає заявок</Typography>
                        )
                    ) : (
                        <CircularProgress />
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setStatsModalOpen(false)}>Закрити</Button>
                </DialogActions>
            </Dialog>

        </Box>

    );
}
