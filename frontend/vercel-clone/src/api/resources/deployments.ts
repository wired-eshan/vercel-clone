import axiosClient from '../axiosClient';

const deploymentsApi = {
    getAll: () => {
        return axiosClient.get('/v1/deployments');
    }
};

export default deploymentsApi;
