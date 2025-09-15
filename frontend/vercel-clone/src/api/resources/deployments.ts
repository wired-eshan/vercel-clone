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
    },
    getDeploymentByProjectId: (projectId: string) => {
        return axiosClient.get(`/v1/deployments/${projectId}`);
    },
    deleteDeployment: (deploymentId : string) => {
        return axiosClient.delete(`/v1/deployments/${deploymentId}`);
    }
};

export default deploymentsApi;
