import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/axios";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

export default function ActivatePassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        // Перевірка співпадіння паролів
        if (password !== confirmPassword) {
            setError("Паролі не співпадають");
            return;
        }

        try {
            await api.post("/auth/set-password", { token, password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 1500);
        } catch (e) {
            setError("Помилка активації");
        }
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <Paper sx={{ p: 4, width: 400 }}>
                <Typography variant="h5" align="center" mb={2}>
                    Створення паролю
                </Typography>

                <TextField
                    type="password"
                    label="Password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="dense"
                />

                <TextField
                    type="password"
                    label="Confirm Password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    margin="dense"
                />

                {error && (
                    <Typography color="error" align="center" mt={1}>
                        {error}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={handleSubmit}
                >
                    Activate
                </Button>

                {success && (
                    <Typography color="green" align="center" mt={2}>
                        Пароль збережено! Переадресація на логін...
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}
