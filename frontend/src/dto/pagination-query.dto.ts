export interface PaginationQueryDto {
    page?: number;
    take?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';

    name?: string;
    surname?: string;
    email?: string;
    phone?: string;

    age?: number;

    course?:string;
    course_format?:string;
    course_type?:string;
    groupName?: string;

    status?: string;
    search?: string;

    manager?: string;
    managerId?: number;
    onlyMy?: boolean;
}