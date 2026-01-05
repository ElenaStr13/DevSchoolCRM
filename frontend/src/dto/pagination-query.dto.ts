export interface PaginationQueryDto {
    page?: number;
    take?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
    course?:string;
    course_format?:string;
    course_type?:string;
    status?: string;
    search?: string;
    manager?: string;
}