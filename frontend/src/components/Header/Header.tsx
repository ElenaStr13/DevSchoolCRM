import React, { useEffect, useState } from 'react';
import { AuthService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import './Header.css';
import {OrdersService} from "../../services/order.service";

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

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
            // тут можна прокинуть filters через context або пропс, якщо Header не знає про Orders
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

                    {/* 🔹 Кнопка "Admin" доступна тільки адміну */}
                    {user?.role === 'admin' && (
                        <Button
                            variant="contained"
                            color="info"
                            onClick={() => navigate('/admin')}
                            sx={{
                                textTransform: 'none',
                                backgroundColor: '#2196f3',
                                '&:hover': { backgroundColor: '#1976d2' },
                            }}
                        >
                            Admin
                        </Button>
                    )}
                    <Button
                        onClick={handleLogout}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Вийти
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        sx={{ textTransform: "none" }}
                        onClick={() => handleExportExcel()}
                    >
                        Експорт Excel
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
