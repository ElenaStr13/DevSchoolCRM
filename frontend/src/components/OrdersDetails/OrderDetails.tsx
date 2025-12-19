import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Divider } from "@mui/material";
import { OrderDto } from "../../dto/order.dto";
import "./OrderDetails.css";

interface OrderDetailsProps {
    order: OrderDto;
    currentUser: { name: string; role: string };
    onAddComment: (orderId: number, comment: string) => Promise<{ author: string; text: string; createdAt: string }>;
    onEditOpen: (order: OrderDto) => void;
}

export default function OrderDetails({ order, currentUser, onAddComment, onEditOpen }: OrderDetailsProps) {
    const [orderState, setOrder] = useState(order);
    const [comment, setComment] = useState("");


    const canComment =
        !orderState.manager || orderState.manager === currentUser.name || currentUser.role === "admin";
    const canEdit = !orderState.manager || orderState.manager === currentUser.name;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const newComment = await onAddComment(orderState.id, comment);

            // newComment гарантовано існує завдяки addComment
            setComment("");
            setOrder(prev => ({
                ...prev,
                comments: prev.comments ? [...prev.comments, newComment] : [newComment],
                manager: prev.manager || currentUser.name,
                status: prev.status === null || prev.status === "New" ? "In Work" : prev.status,
            }));
            setComment("");
        } catch (err) {
            console.error("Помилка при додаванні коментаря:", err);
            alert("Не вдалося додати коментар!");
        }
    };

    return (
        <div className="order-details-wrapper">

            <div className="order-details-title">Заявка №{orderState.id}</div>

            <div className="details-row">
                <div>
                    <span className="details-label">Message: </span>
                    <span className="details-value">{orderState.message || "—"}</span>
                </div>

                <div>
                    <span className="details-label">UTM: </span>
                    <span className="details-value">{orderState.utm || "—"}</span>
                </div>
            </div>

            <div className="details-row">
                <div>
                    <span className="details-label">Статус: </span>
                    <span className="details-value">{orderState.status || "—"}</span>
                </div>

                <div>
                    <span className="details-label">Менеджер: </span>
                    <span className="details-value">{orderState.manager || "—"}</span>
                </div>
            </div>

            <div className="details-label" style={{ marginTop: "15px" }}>Коментарі</div>

            <div className="comment-list">
                {orderState.comments?.length ? (
                    orderState.comments.map((c, i) => (
                        <div key={i} className="comment-item">
                            <div className="comment-meta">
                                {c.author} — {new Date(c.createdAt).toLocaleString()}
                            </div>
                            <div className="comment-text">{c.text}</div>
                        </div>
                    ))
                ) : (
                    <div className="comment-meta">Коментарів поки немає</div>
                )}
            </div>

            {canComment && (
                <form className="comment-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Введіть коментар..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        style={{
                            flexGrow: 1,
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                        }}
                    />
                    <button type="submit" className="edit-btn">Comment</button>
                </form>
            )}

            <button className="edit-btn" onClick={() => onEditOpen(orderState)}>
                EDIT
            </button>
        </div>
    );
}
