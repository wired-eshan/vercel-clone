import axiosClient from "../axiosClient";

interface LoginData {
    email: string;
    password: string;
}

interface SignupData {
    email: string;
    password: string;
}

const authApi: any = {
    login: (data : LoginData) => {
        return axiosClient.post('/v1/auth/login', data);
    },
    signup: (data : SignupData) => {
        return axiosClient.post('/v1/auth/signup', data);
    },
    logout: () => {
        return axiosClient.post('/v1/auth/logout');
    },
    checkAuthStatus: () => {
        return axiosClient.get('/v1/auth/authenticate');
    },
};

export default authApi;
