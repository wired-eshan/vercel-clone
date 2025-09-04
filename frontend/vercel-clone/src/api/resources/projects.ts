import axiosClient from '../axiosClient';

interface createProjectData {
    URL: string;
}

const projectsApi = {
    getAll: () => {
        return axiosClient.get('/v1/projects');
    },
    create: (data : createProjectData) => {
        return axiosClient.post('/v1/projects/create', data);
    }
};

export default projectsApi;
