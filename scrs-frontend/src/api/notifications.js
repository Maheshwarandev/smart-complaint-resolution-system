import client from './client';

export const getNotificationsAPI = () => client.get('/notifications');
export const markNotificationReadAPI = (id) => client.put(`/notifications/${id}/read`);
export const markAllNotificationsReadAPI = () => client.put('/notifications/read-all');
