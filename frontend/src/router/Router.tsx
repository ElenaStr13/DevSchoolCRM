import { Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import GroupsPage from '../pages/GroupsPage';
import PrivateLayout from "../layouts/MainLayout";
import OrdersPage from "../pages/OrdersPage";
import { createBrowserRouter } from 'react-router-dom';
import AdminPage from "../pages/AdminPage";
import ActivatePage from "../pages/ActivatePage";
import  PrivateRoute  from '../components/PrivateRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <PrivateRoute>
                <PrivateLayout />
            </PrivateRoute>
        ),
        children: [
            { index: true, element: <Navigate to="orders" replace /> },
            { path: 'groups', element: <GroupsPage /> },
            { path: 'orders', element: <OrdersPage /> },
            { path: 'admin', element: <AdminPage /> },
            //{ path: 'activate/:token', element: <ActivatePage /> },
        ],
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/activate/:token',
        element: <ActivatePage />,
    },
]);

export default router;