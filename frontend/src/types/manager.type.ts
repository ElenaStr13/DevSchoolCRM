export type Manager = {
    id: number;
    email: string;
    name: string;
    surname: string;
    isActive: boolean;
    last_login?: string;
    totalOrders?: number;
};