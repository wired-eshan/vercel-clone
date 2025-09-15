import axiosClient from '../axiosClient';

interface createProjectData {
    gitUrl: string;
}

interface uploadProjectData {
    projectId: string
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
    }
};

export default projectsApi;
