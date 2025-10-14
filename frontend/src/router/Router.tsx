import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import GroupsPage from '../pages/GroupsPage';
import PrivateLayout from "../layouts/MainLayout";
import OrdersPage from "../pages/OrdersPage";
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />, // Редірект з кореня на /login
    },
    {
        path: '/login',
        element: <LoginPage />, // Сторінка логіна
    },
    {
        path: '/',
        element: <PrivateLayout />, // Використовуємо PrivateLayout як основу
        errorElement: <h1>Error</h1>,
        children: [
            {
                path: '/groups',
                element: <GroupsPage />,
            },
            {
                path: '/orders',
                element: <OrdersPage />,
            },
        ],
    },
]);

export default router;