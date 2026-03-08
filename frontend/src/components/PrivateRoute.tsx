import  { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

type Props = {
    children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);



    useEffect(() => {
        const checkAuth = async () => {
            try {
                await AuthService.getMe(); // ← ГОЛОВНЕ
                setIsAuth(true);
            } catch {
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <p className="text-center mt-10">Завантаження...</p>;
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}


