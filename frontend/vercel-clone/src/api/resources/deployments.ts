import axiosClient from '../axiosClient';

const deploymentsApi = {
    getAll: () => {
        return axiosClient.get('/v1/deployments');
    },
    getLogsById: (deploymentId : string, timeStamp: string) => {
        return axiosClient.get(`/v1/deployments/logs?deploymentId=${deploymentId}&since=${timeStamp}`)
    },
    getStatus: (deploymentId : string) => {
        return axiosClient.get(`/v1/deployments/status/${deploymentId}`)
    }
};

export default deploymentsApi;
