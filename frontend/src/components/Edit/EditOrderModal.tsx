import React, { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { OrdersService } from "../../services/order.service";
import { OrderDto } from "../../dto/order.dto";
import "./EditOrderModal.css";

interface EditOrderModalProps {
    open: boolean;
    onClose: () => void;
    order: OrderDto;
    currentUser: { name: string; role: string };
    onUpdate: (updatedOrder: OrderDto) => void;
}

const statusOptions = ["In work", "New", "Aggre", "Disaggre", "Dubbing"];
const courseOptions = ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"];
const courseTypeOptions = ["pro", "minimal", "premium", "incubator", "vip"];
const courseFormatOptions = ["static", "online"];

export default function EditOrderModal({
                                           open,
                                           onClose,
                                           order,
                                           currentUser,
                                           onUpdate,
                                       }: EditOrderModalProps) {
    const [form, setForm] = useState({
        groupId: order.group?.id || null,
        groupName: order.group?.name || "",
        name: order.name || "",
        surname: order.surname || "",
        email: order.email || "",
        phone: order.phone || "",
        age: order.age?.toString() || "",
        status: order.status || "",
        sum: order.sum?.toString() || "",
        alreadyPaid: order.alreadyPaid?.toString() || "",
        course: order.course || "",
        courseType: order.course_type || "",
        courseFormat: order.course_format || "",
    });

    const [groups, setGroups] = useState<{id: number; name: string}[]>([]);
    const [selectOpen, setSelectOpen] = useState(false);

    // Завантаження існуючих груп
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const existingGroups = await OrdersService.getGroups();
                setGroups(existingGroups);
            } catch (err) {
                console.error(err);
            }
        };
        fetchGroups();
    }, []);

    // Вибір групи
    const handleSelectGroup = (group: {id: number; name: string}) => {
        setForm((prev) => ({
            ...prev,
            groupId: group.id,
            groupName: group.name
        }));
        setSelectOpen(false);
    };

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddGroup = async () => {
        const newName = form.groupName.trim();
        if (!newName) return alert("Введіть назву групи!");

        if (groups.some(g => g.name === newName)) return alert("Група вже існує!");

        try {
            const newGroup = await OrdersService.createGroup(newName);
            setGroups(prev => [...prev, newGroup]);
            setForm(prev => ({ ...prev, groupId: newGroup.id, groupName: newGroup.name }));
        } catch (err) {
            console.error(err);
            alert("Не вдалося створити групу!");
        }
    };

    const handleSubmit = async () => {
        const updatedData: any = {};

        if (form.name?.trim().length >= 2) updatedData.name = form.name.trim();
        if (form.surname?.trim().length >= 2) updatedData.surname = form.surname.trim();
        if (form.email?.trim()) updatedData.email = form.email.trim();
        if (form.phone?.trim()) updatedData.phone = form.phone.trim();
        if (form.age && !isNaN(Number(form.age))) updatedData.age = Number(form.age);
        if (form.status) updatedData.status = form.status;
        if (form.sum && !isNaN(Number(form.sum))) updatedData.sum = Number(form.sum);
        if (form.alreadyPaid && !isNaN(Number(form.alreadyPaid))) updatedData.alreadyPaid = Number(form.alreadyPaid);
        if (form.course) updatedData.course = form.course;
        if (form.courseFormat) updatedData.course_format = form.courseFormat;
        if (form.courseType) updatedData.course_type = form.courseType;

        if (form.groupName?.trim()) {
            updatedData.groupName = form.groupName.trim();
        }

        try {
            const updatedOrder = await OrdersService.updateOrder(order.id, updatedData, currentUser);
            onUpdate(updatedOrder);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Не вдалося оновити заявку!");
        }
    };

    const canEdit = !order.manager || order.manager === currentUser.name;
    if (!canEdit) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="edit-modal">
                <Typography variant="h6" className="modal-title">
                    Редагування заявки #{order.id}
                </Typography>

                {/* === ГРУПА === */}
                <Box className="group-section" mt={2}>
                    <TextField
                        label="Group"
                        value={form.groupName}
                        onChange={(e) => handleChange("groupName", e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ mb: 1 }}
                    />
                    <Box display="flex" justifyContent="space-between" gap={1}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setSelectOpen(true)}
                            sx={{ textTransform: "none" }}
                        >
                            SELECT
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            onClick={handleAddGroup}
                            sx={{ textTransform: "none" }}
                        >
                            ADD
                        </Button>
                    </Box>
                </Box>

                {/* Модальне вікно для вибору групи */}
                <Dialog open={selectOpen} onClose={() => setSelectOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Вибір групи</DialogTitle>
                    <DialogContent dividers>
                        {groups.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Немає доступних груп
                            </Typography>
                        ) : (
                            groups.map((g) => (
                                <Button
                                    key={g.id} // використовуємо унікальний id
                                    fullWidth
                                    variant={form.groupId === g.id ? "contained" : "outlined"} // порівнюємо по id
                                    sx={{ mb: 1, justifyContent: "flex-start" }}
                                    onClick={() => handleSelectGroup(g)} // використовуємо функцію вибору групи
                                >
                                    {g.name} {/* показуємо назву */}
                                </Button>
                            ))
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectOpen(false)}>Закрити</Button>
                    </DialogActions>
                </Dialog>

                {/*  ІНША ФОРМА  */}
                <Box className="form-grid">
                    <Box className="form-column">
                        <TextField
                            fullWidth
                            label="Name"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Surname"
                            value={form.surname}
                            onChange={(e) => handleChange("surname", e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Phone"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Age"
                            value={form.age}
                            onChange={(e) => handleChange("age", e.target.value)}
                            margin="normal"
                        />
                    </Box>

                    <Box className="form-column">
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={form.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                {statusOptions.map((s) => (
                                    <MenuItem key={s} value={s}>
                                        {s}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Sum"
                            value={form.sum}
                            onChange={(e) => handleChange("sum", e.target.value)}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            label="Already Paid"
                            value={form.alreadyPaid}
                            onChange={(e) => handleChange("alreadyPaid", e.target.value)}
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Course</InputLabel>
                            <Select
                                value={form.course}
                                onChange={(e) => handleChange("course", e.target.value)}
                            >
                                {courseOptions.map((c) => (
                                    <MenuItem key={c} value={c}>
                                        {c}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Course format</InputLabel>
                            <Select
                                value={form.courseFormat}
                                onChange={(e) => handleChange("courseFormat", e.target.value)}
                            >
                                {courseFormatOptions.map((cf) => (
                                    <MenuItem key={cf} value={cf}>
                                        {cf}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Course type</InputLabel>
                            <Select
                                value={form.courseType}
                                onChange={(e) => handleChange("courseType", e.target.value)}
                            >
                                {courseTypeOptions.map((ct) => (
                                    <MenuItem key={ct} value={ct}>
                                        {ct}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Кнопки дії */}
                <Box className="modal-actions">
                    <Button variant="outlined" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
