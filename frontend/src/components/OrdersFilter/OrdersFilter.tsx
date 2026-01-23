import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    MenuItem,
} from "@mui/material";
import "./OrdersFilter.css";
import { StatusEnum, CourseEnum, CourseFormatEnum, CourseTypeEnum } from "../../constants/enums"; // імпортуй свої enums



export interface OrdersFilterProps {
    onChange: (filters: Record<string, any>) => void;
}

export default function OrdersFilter({ onChange }: OrdersFilterProps) {
    const [filters, setFilters] = useState<Record<string, string | number | undefined>>({});
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

      const handleChange = (field: string, value: string | number | undefined) => {
        const updated = { ...filters, [field]: value };
        setFilters(updated);

        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => onChange(updated), 600);
        setTypingTimeout(timeout);
    };

    const handleReset = () => {
        setFilters({});
        onChange({});
    };


    return (
        <Box className="filter-container">
            <Box className="filter-grid">
                {/* Прості текстові поля */}
                {["name", "surname", "email", "phone", "age", "manager", "groupName"].map((field) => {
                    const isAge = field === "age";
                    return (
                        <TextField
                            key={field}
                            label={field}
                            variant="outlined"
                            size="small"
                            type={isAge ? "number" : "text"}
                            value={filters[field] ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleChange(field, isAge ? (value === "" ? undefined : Number(value)) : value);
                            }}
                        />
                    );
                })}

                {/* Селект для Course */}
                <TextField
                    select
                    label="course"
                    size="small"
                    variant="outlined"
                    value={filters.course ?? ""}
                    onChange={(e) => handleChange("course", e.target.value)}
                >
                    <MenuItem value="">— Всі —</MenuItem>
                    {Object.values(CourseEnum).map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Селект для Course Format */}
                <TextField
                    select
                    label="course_format"
                    size="small"
                    variant="outlined"
                    value={filters.course_format ?? ""}
                    onChange={(e) => handleChange("course_format", e.target.value)}
                >
                    <MenuItem value="">— Всі —</MenuItem>
                    {Object.values(CourseFormatEnum).map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Селект для Course Type */}
                <TextField
                    select
                    label="course_type"
                    size="small"
                    variant="outlined"
                    value={filters.course_type ?? ""}
                    onChange={(e) => handleChange("course_type", e.target.value)}
                >
                    <MenuItem value="">— Всі —</MenuItem>
                    {Object.values(CourseTypeEnum).map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Селект для Status */}
                <TextField
                    select
                    label="status"
                    size="small"
                    variant="outlined"
                    value={filters.status ?? ""}
                    onChange={(e) => handleChange("status", e.target.value)}
                >
                    <MenuItem value="">— Всі —</MenuItem>
                    {Object.values(StatusEnum).map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {/* Чекбокс "тільки мої" */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={filters.onlyMy === "true"}
                        onChange={(e) => {
                            const updated = { ...filters };
                            if (e.target.checked) updated.onlyMy = "true";
                            else delete updated.onlyMy;
                            setFilters(updated);
                            onChange(updated);
                            //onFilterChange(updated);
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
