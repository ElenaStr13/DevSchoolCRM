import React from 'react';
import LoginForm from '../components/LoginForm/LoginForm';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
    const navigate = useNavigate();
    const handleLoginSuccess = () => {
        navigate('/orders');
    };

    return (
    <Box
        sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f2f5', // Світлий фон
        }}
    >
        <LoginForm  onLoginSuccess={handleLoginSuccess}/>
    </Box>
    )

}
