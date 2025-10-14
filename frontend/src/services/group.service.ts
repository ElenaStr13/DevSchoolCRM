import api from '../api/axios';

export const GroupService = {
    getAll: async () => {
        const res = await api.get('/groups');
        return res.data;
    },
    create: async (name: string) => {
        const res = await api.post('/groups', { name });
        return res.data;
    }
};
