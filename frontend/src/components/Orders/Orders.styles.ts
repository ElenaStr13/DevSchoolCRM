import { Box, Button, TableHead, TableCell } from "@mui/material";
import { styled } from "@mui/material/styles";

// Заголовок таблиці — світло-зелений
export const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: "#d9ead3",
    position: "sticky",
    top: 0,
    zIndex: 10,
    "& th": {
        fontWeight: 600,
        fontSize: "0.8rem",        // менший шрифт у заголовку
        padding: "6px 8px",        // менше відступів
        whiteSpace: "nowrap",
        textAlign: "left",
        color: "#1a3e1a",
    },
}));

// Стилі для всіх комірок (і заголовок, і тіло)
export const CompactTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.8rem",          // менший шрифт
    padding: "6px 8px",          // компактні відступи
    whiteSpace: "nowrap",        // не переносимо текст
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 150,               // обмежуємо ширину (email, телефон і т.д.)
}));

// Пагінація
export const StyledPagination = styled(Box)(() => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "20px",
}));

export const PageButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
    minWidth: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: active ? "#6aa84f" : "#b6d7a8",
    color: "white",
    "&:hover": {
        backgroundColor: active ? "#38761d" : "#93c47d",
    },
}));