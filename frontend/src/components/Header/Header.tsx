import React, { useEffect, useState } from 'react';
import { AuthService } from '../../services/auth.service';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import './Header.css';
import {OrdersService} from "../../services/order.service";

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isOrdersPage = location.pathname.startsWith('/orders');
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        AuthService.getMe()
            .then((data) => {
                setUser(data);
            })
            .catch((err) => {
                console.error(" Помилка при отриманні користувача:", err);
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const handleExportExcel = async () => {
        try {
            // беремо фільтри зі сторінки Orders
            const filters = JSON.parse(localStorage.getItem("ordersFilters") || "{}");

            // запит на бекенд
            const response = await OrdersService.getAllForExport(filters);

            // створюємо файл і завантажуємо
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Помилка при експорті Excel:", err);
        }
    };
    return (
        <AppBar position="static" sx={{ backgroundColor: '#1f2937' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                        src="/logo.webp"
                        alt="Logo"
                        sx={{ width: 48, height: 48, borderRadius: 2 }}
                        variant="rounded"
                    />
                    <Typography variant="h6" fontWeight="bold">
                        CRM Programming School
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    {user && <Typography>{user.email}</Typography>}

                    {isAdminPage && (
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/orders')}
                            sx={{ textTransform: 'none' }}
                        >
                            До заявок
                        </Button>
                    )}

                    {user?.role === 'admin' && !isAdminPage && (
                        <Button
                            variant="contained"
                            color="info"
                            onClick={() => navigate('/admin')}
                            sx={{ textTransform: 'none' }}
                        >
                            Admin
                        </Button>
                    )}

                    <Button
                        onClick={handleLogout}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                        Вийти
                    </Button>

                    {isOrdersPage && (
                        <Button
                            variant="contained"
                            color="success"
                            sx={{ textTransform: 'none' }}
                            onClick={handleExportExcel}
                        >
                            Експорт Excel
                        </Button>
                    )}
                </Box>

            </Toolbar>
        </AppBar>
    );
}
