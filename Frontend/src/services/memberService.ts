import api from './api';

export const fetchProfile = async () => {
    const response = await api.get('/member');
    return response.data;
};

export const fetchDashboard = async () => {
    const response = await api.get('/member/dashboard');
    return response.data;
};

export const fetchIssues = async (status?: string) => {
    const response = await api.get('/member/issues', { params: { status } });
    return response.data;
};

export const fetchReservations = async () => {
    const response = await api.get('/member/reservations');
    return response.data;
};

export const reserveBook = async (bookId: number) => {
    const response = await api.post('/member/reservations', { bookId });
    return response.data;
};

export const cancelReservation = async (reservationId: number) => {
    const response = await api.delete(`/member/reservations/${reservationId}`);
    return response.data;
};

export const fetchFines = async () => {
    const response = await api.get('/member/fines');
    return response.data;
};

export const setPin = async (pin: string) => {
    const response = await api.put('/member/set-pin', { pin });
    return response.data;
};

export const updatePin = async (currentPin: string, newPin: string) => {
    const response = await api.put('/member/update-pin', { currentPin, newPin });
    return response.data;
};

export const updateProfile = async (data: {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
}) => {
    const response = await api.put('/member/profile', data);
    return response.data;
};

export const renewIssue = async (issueId: number) => {
    const response = await api.put(`/member/issues/${issueId}/renew`);
    return response.data;
};

export const fetchNotifications = async () => {
    const response = await api.get('/member/notifications');
    return response.data;
};

export const sendContact = async (subject: string, message: string) => {
    const response = await api.post('/member/contact', { subject, message });
    return response.data;
};
