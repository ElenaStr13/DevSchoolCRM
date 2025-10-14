import  { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';



export default function PrivateRoute({ children }: any) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!AuthService.isAuthenticated()) {
                    setIsAuth(false);
                } else {
                    await AuthService.getMe(); // запитує /auth/me
                    setIsAuth(true);
                }
            } catch (e) {
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) return <p className="text-center mt-10">Завантаження...</p>;
    if (!isAuth) return <Navigate to="/login" replace />;

    return children;
}
