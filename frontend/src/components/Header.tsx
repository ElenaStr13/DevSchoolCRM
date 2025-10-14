import React, { useEffect, useState } from 'react';
import { AuthService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        AuthService.getMe()
            .then(setUser)
            .catch(() => navigate('/login'));
    }, [navigate]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <header className="bg-gray-800 text-white flex justify-between items-center px-6 py-3">
            <h1 className="text-lg font-bold">CRM Programming School</h1>

            <div className="flex items-center space-x-4">
                {user && <span>{user.email}</span>}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                    Вийти
                </button>
            </div>
        </header>
    );
}
