export interface PaginationQueryDto {
    page?: number;
    take?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
    status?: string;
    search?: string;
    manager?: string;
}