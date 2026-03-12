import api from './api';

interface FetchBooksParams {
    search?: string;
    author?: string;
    genre?: string;
    sort?: string;
    page?: number;
    limit?: number;
    id?: number;
}

export const fetchBooks = async (params: FetchBooksParams = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
};

export const fetchBookById = async (id: number) => {
    const response = await api.get('/books', { params: { id } });
    return response.data;
};

export const fetchGenres = async (): Promise<{ id: number; name: string }[]> => {
    const response = await api.get('/books/genres');
    return response.data;
};
