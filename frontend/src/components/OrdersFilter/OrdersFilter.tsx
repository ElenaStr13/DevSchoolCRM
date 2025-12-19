import  {useState } from "react";
import {Box, TextField, Button, FormControlLabel, Checkbox} from "@mui/material";
import "./OrdersFilter.css";

interface OrdersFilterProps {
    onFilterChange: (filters: Record<string, string>) => void;
}

const filterFields = [
    "name",
    "surname",
    "email",
    "phone",
    "age",
    "course",
    "course_format",
    "course_type",
    "status",
    "manager",
    "groupName",
];

export default function OrdersFilter({ onFilterChange }: OrdersFilterProps) {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    // Обробка змін у фільтрах із debounce
    const handleChange = (field: string, value: string) => {
        const updated = { ...filters, [field]: value };
        setFilters(updated);

        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => onFilterChange(updated), 600);
        setTypingTimeout(timeout);
    };

    const handleReset = () => {
        setFilters({});
        onFilterChange({});
    };

    return (
        <Box className="filter-container">
            <Box className="filter-grid">
                {filterFields.map((field) => (
                    <TextField
                        key={field}
                        label={field}
                        variant="outlined"
                        size="small"
                        value={filters[field] || ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                    />
                ))}
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={filters.onlyMy === "true"}
                        onChange={(e) => {
                            const updated = {
                                ...filters,
                                onlyMy: e.target.checked ? "true" : "false"
                            };
                            setFilters(updated);
                            onFilterChange(updated);
                        }}
                    />
                }
                label="Показати тільки мої"
            />
            <Box className="filter-actions">
                <Button variant="outlined" color="secondary" onClick={handleReset}>
                    Скинути фільтри
                </Button>
            </Box>
        </Box>
    );
}
