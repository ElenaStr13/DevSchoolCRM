import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { TextField, Button, Alert } from '@mui/material';
import { FormContainer, PageContainer } from './Login.styles';

interface LoginFormInputs {
    email: string;
    password: string;
}

interface LoginFormProps {
    onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Введіть коректний email';
    };

    const validatePassword = (value: string) => {
        return value.length >= 5 || 'Неправильний пароль';
    };

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        const { email, password } = data;
        setApiError(null); // Скидаємо попередню помилку

        try {
            const res = await AuthService.login(email, password);
            if (res.accessToken && res.refreshToken && res.user) {
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('accessToken', res.accessToken);
            localStorage.setItem('refreshToken', res.refreshToken);
            localStorage.setItem('user', JSON.stringify(res.user));
            onLoginSuccess();
            navigate('/orders');
            } else {
                throw new Error('Невірна структура відповіді від сервера');
            }
        } catch (err: any) {
            console.log('Помилка:', err);
            console.log('Помилка:', err);
            if (err.response) {
                const status = err.response.status;
                const errorMessage = err.response.data?.message || 'Помилка авторизації';
                if (status === 401) {
                    setApiError(errorMessage === 'Invalid credentials' ? 'Невірний email або пароль' : errorMessage);
                } else if (status === 403) {
                    setApiError('Користувач заблокований');
                } else if (status === 400) {
                    setApiError('Перевірте введені дані');
                } else {
                    setApiError('Щось пішло не так. Спробуйте пізніше.');
                }
            } else {
                setApiError('Помилка з’єднання з сервером. Спробуйте пізніше.');
            }
        }
    };

    return (
        <PageContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
        <FormContainer >
            <h2 style={{ textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>Вхід у CRM</h2>

            {apiError && <Alert severity="error">{apiError}</Alert>}
            {errors.email && <Alert severity="error">{errors.email.message}</Alert>}
            {errors.password && <Alert severity="error">{errors.password.message}</Alert>}

            <TextField
                fullWidth
                type="email"
                label="Email"
                {...register('email', {
                    required: 'Email є обов’язковим',
                    validate: validateEmail,
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                required
            />

            <TextField
                fullWidth
                type="password"
                label="Пароль"
                {...register('password', {
                    required: 'Пароль є обов’язковим',
                    validate: validatePassword,
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                required
                autoComplete="current-password"
            />

            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ backgroundColor: '#26e37d', color: '#fff', mt: 2 }}
            >
                Увійти
            </Button>
        </FormContainer>
            </form>
        </PageContainer>
    );
}
