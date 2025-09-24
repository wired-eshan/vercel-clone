import type { AxiosRequestConfig } from 'axios';
import axiosClient from '../axiosClient';

interface createProjectData {
    gitUrl: string;
}

interface uploadProjectData {
    projectId: string
}

interface getProjectAnalyticsData {
    startDateString: string | undefined,
    endDateString: string | undefined
}

const projectsApi = {
    getAll: () => {
        return axiosClient.get('/v1/projects');
    },
    create: (data : createProjectData) => {
        return axiosClient.post('/v1/projects/create', data);
    },
    upload: (data : uploadProjectData) => {
        return axiosClient.post('v1/projects/upload', data);
    },
    deleteProject: (projectId: string) => {
        return axiosClient.delete(`/v1/projects/${projectId}`);
    },
    getAnalytics: () => {
        return axiosClient.get(`/v1/projects/analytics`);
    },
    getProjectAnalytics: (projectId: string, data : getProjectAnalyticsData) => {
        return axiosClient.post(`/v1/projects/analytics/${projectId}`, data);
    }
};

export default projectsApi;
