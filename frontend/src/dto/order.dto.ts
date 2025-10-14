export interface OrderDto {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number;
    course: string;
    course_format: string;
    course_type: string;
    status: string | null;
    sum: number;
    alreadyPaid: number;
    created_at: string;
    manager?: string | null;
    groupName?: string | null;
}
