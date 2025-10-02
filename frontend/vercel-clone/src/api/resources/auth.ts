import axiosClient from "../axiosClient";

interface LoginData {
    email: string;
    password: string;
}

const authApi: any = {
    login: (data : LoginData) => {
        return axiosClient.post('/v1/auth/login', data);
    },
    logout: () => {
        return axiosClient.post('/v1/auth/logout');
    },
    checkAuthStatus: () => {
        return axiosClient.get('/v1/auth/authenticate');
    },
};

export default authApi;
