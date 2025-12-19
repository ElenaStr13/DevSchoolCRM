import React from "react";
import { StyledPagination, PageButton } from "../Orders/Orders.styles";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const buttons: React.ReactNode[] = [];

    // ⬅️ Кнопка "Назад"
    if (page > 1) {
        buttons.push(
            <PageButton key="prev" onClick={() => onPageChange(page - 1)}>
                &lt;
            </PageButton>
        );
    }

    const visiblePages: number[] = [];

    if (totalPages <= 8) {
        // Якщо сторінок мало — показуємо всі
        for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
    } else {
        // Динамічне "вікно"
        const windowSize = 7; // 7 видимих сторінок у центрі
        let start = Math.max(2, page - 3);
        let end = Math.min(totalPages - 1, page + 3);

        // 🧩 Коли користувач близько до кінця — зрушуємо вікно вліво
        if (page >= totalPages - 3) {
            start = totalPages - (windowSize - 1);
            end = totalPages - 1;
        }

        visiblePages.push(1);

        if (start > 2) visiblePages.push(-1); // ...
        for (let i = start; i <= end; i++) visiblePages.push(i);
        if (end < totalPages - 1) visiblePages.push(-2); // ...
        visiblePages.push(totalPages);
    }

    // 🔢 Малюємо сторінки
    for (const p of visiblePages) {
        if (p === -1 || p === -2) {
            buttons.push(
                <span key={`dots-${p}`} style={{ margin: "0 6px" }}>
          ...
        </span>
            );
        } else {
            buttons.push(
                <PageButton key={p} active={p === page} onClick={() => onPageChange(p)}>
                    {p}
                </PageButton>
            );
        }
    }

    // ➡️ Кнопка "Вперед"
    if (page < totalPages) {
        buttons.push(
            <PageButton key="next" onClick={() => onPageChange(page + 1)}>
                &gt;
            </PageButton>
        );
    }

    return <StyledPagination>{buttons}</StyledPagination>;
}
